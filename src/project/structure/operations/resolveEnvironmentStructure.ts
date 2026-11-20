import { basename } from "node:path";

import { flat, sort } from "@auaust/toolkit/array";
import { freeze, getOwn, keys } from "@auaust/toolkit/object";

import {
  getEntryFile,
  getIndexFile,
  type EnvironmentRoles,
  type ResolvedRoles,
  type RoleRegistry,
} from "#batiment/roles/index";
import { assignRoleFiles } from "#project/structure/operations/assignRoleFiles";
import { createStructureDomainResolver } from "#project/structure/operations/createStructureDomainResolver";
import { createStructureRoleResolver } from "#project/structure/operations/createStructureRoleResolver";
import { createStructureWalker } from "#project/structure/operations/createStructureWalker";
import { collectStructureNodes } from "#project/structure/utils/collectStructureNodes";
import { createMirrorClassifier } from "#project/structure/utils/createMirrorClassifier";
import { groupRoleFiles } from "#project/structure/utils/groupRoleFiles";
import { listStructureRoles } from "#project/structure/utils/listStructureRoles";
import { loosenStructureNode } from "#project/structure/utils/loosenStructureNode";
import type { ProgramLayout } from "#batiment/environments/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { StructureDiagnostic } from "#project/structure/types/StructureDiagnostic";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { TestsContext } from "#project/structure/types/TestsContext";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

const environmentRoot = ".";
const projectRoot = ".";

function dropCollects(
  node: StructureNode,
  dropped: ReadonlyMap<Directory, ReadonlySet<string>>,
): StructureNode {
  const roles = dropped.get(node.path);

  return freeze({
    ...node,
    ...(roles === undefined || node.collects === undefined
      ? {}
      : { collects: node.collects.filter((role) => !roles.has(role)) }),
    children: node.children.map((child) => dropCollects(child, dropped)),
  });
}

export async function resolveEnvironmentStructure({
  name,
  filesystem,
  dirs,
  options,
  roles,
  defined,
  tests,
  tree,
  internals = false,
}: {
  name: string;
  filesystem: Filesystem;
  dirs: Directories;
  options: StructureOptions;
  internals?: boolean;
  roles?: EnvironmentRoles | undefined;
  defined?: RoleRegistry;
  tests?: TestsContext;
  tree?: ProgramLayout | undefined;
}): Promise<{
  readonly structure: Omit<
    EnvironmentStructure,
    "unreached" | "diagnostics" | "entries"
  >;
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const { strictness, namespaces } = options;
  const commands = tree === "commands";
  const diagnostics: StructureDiagnostic[] = [];

  function report(diagnostic: StructureDiagnostic) {
    diagnostics.push(diagnostic);
  }

  const roleResolver = createStructureRoleResolver({
    name,
    filesystem,
    roles,
    defined,
  });

  const { rolesFor } = roleResolver;
  const rolesIn = new Map<StructureNode, ResolvedRoles>();
  const indexFile = getIndexFile(rolesFor([]));
  const entryFile = getEntryFile(rolesFor([]));

  const domainResolver = createStructureDomainResolver({
    name,
    filesystem,
    options,
    commands,
    indexFile,
    entryFile,
    internals,
    rolesFor,
    report,
  });

  const walk = createStructureWalker({
    filesystem,
    options,
    commands,
    indexFile,
    rolesIn,
    roleResolver,
    domainResolver,
    classifyMirror: tests === undefined
      ? undefined
      : createMirrorClassifier(tests),
  });

  const rootDeclaration = namespaces[environmentRoot];
  const rootScopes = rootDeclaration?.roles.enable ?? [];

  const walked = dirs.filter((directory) => directory !== projectRoot);

  const children = flat(
    await Promise.all(
      walked.map((directory) => {
        return walk(directory, environmentRoot, {
          kind: "root",
          layers: rootDeclaration?.layers,
          ...(rootDeclaration?.children === undefined
            ? {}
            : { childKind: rootDeclaration.children }),
          scopes: rootScopes,
          owned: rootScopes,
          structured: false,
          source: rootDeclaration?.source ?? "inferred",
          location: freeze({
            environment: name,
            lineage: freeze([
              freeze({
                name: basename(directory),
                path: directory,
                kind: "namespace" as const,
              }),
            ]),
            roles: freeze([]),
          }),
        });
      }),
    ),
  );

  const rootRoleFiles = groupRoleFiles(
    flat(
      await Promise.all(
        walked.map((directory) => {
          return assignRoleFiles(filesystem, directory, rolesFor(rootScopes));
        }),
      ),
    ),
  );

  const resolvedRoot: StructureNode = freeze({
    path: environmentRoot,
    name,
    kind: "namespace",
    source: rootDeclaration?.source ?? "inferred",
    ...(commands ? { commands: true as const } : {}),
    ...(rootDeclaration?.layers === undefined
      ? {}
      : { layers: rootDeclaration.layers }),
    ...(rootDeclaration === undefined
      ? {}
      : { relation: rootDeclaration.relation }),
    ...(rootDeclaration?.children === undefined
      ? {}
      : { childKind: rootDeclaration.children }),
    ...(rootDeclaration?.purpose === undefined
      ? {}
      : { purpose: rootDeclaration.purpose }),
    ...(keys(rootRoleFiles).length === 0 ? {} : { roleFiles: rootRoleFiles }),
    children,
  });

  const structureRoles = listStructureRoles(
    resolvedRoot,
    walked.map((directory) => {
      return { directory, roles: rolesFor(rootScopes) };
    }),
    rolesIn,
  );

  const dropped = new Map<Directory, ReadonlySet<string>>();

  for (const { path, collects } of collectStructureNodes(resolvedRoot)) {
    const invalid = (collects ?? []).filter((role) => {
      const contract = getOwn(structureRoles, role)?.contract;

      return contract === undefined || !contract.public || !contract.collected;
    });

    if (invalid.length > 0) {
      dropped.set(path, new Set(invalid));
    }

    const source = domainResolver.collectsSourceOf(path);

    for (const role of invalid) {
      report(
        freeze({
          severity: "error",
          code: "collected-role-not-public",
          message: `${path} collects the role ${role}, which is not a public collected role of its environment; dropping it from its collects`,
          blocking: true,
          environment: name,
          files: freeze([...(source?.files ?? [])]),
          ...(source?.config === undefined ? {} : { config: source.config }),
        }),
      );
    }
  }

  const collectedRoot = dropped.size === 0
    ? resolvedRoot
    : dropCollects(resolvedRoot, dropped);

  const rootNode = strictness === "loose"
    ? loosenStructureNode(collectedRoot, name === "tests" ? "mirror" : "domain")
    : collectedRoot;

  const sorted = sort(diagnostics, (left, right) => {
    return left.message.localeCompare(right.message);
  });

  return freeze({
    structure: freeze({
      name,
      dirs,
      indexFile,
      entryFile,
      strictness,
      root: rootNode,
      unclassified: collectStructureNodes(rootNode).filter(
        ({ kind }) => kind === "unclassified",
      ),
      roles: structureRoles,
    }),
    diagnostics: freeze(sorted),
  });
}
