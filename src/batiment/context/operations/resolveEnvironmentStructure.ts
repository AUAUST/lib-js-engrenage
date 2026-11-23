import { basename } from "node:path";

import { flat, sort } from "@auaust/toolkit/array";
import { entries, freeze, getOwn, keys } from "@auaust/toolkit/object";

import { assignRoleFiles } from "#batiment/context/operations/assignRoleFiles";
import { createStructureDomainResolver } from "#batiment/context/operations/createStructureDomainResolver";
import { createStructureRoleResolver } from "#batiment/context/operations/createStructureRoleResolver";
import { createStructureWalker } from "#batiment/context/operations/createStructureWalker";
import {
  getEntryFile,
  getIndexFile,
  type EnvironmentRoles,
  type ResolvedRoles,
  type RoleRegistry,
} from "#batiment/roles/index";
import {
  collectStructureNodes,
  createMirrorClassifier,
  groupRoleFiles,
  listStructureRoles,
  loosenStructureNode,
  type EnvironmentStructure,
  type Layout,
  type StructureNode,
  type StructureOptions,
  type TestsContext,
} from "#batiment/structure/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Filesystem } from "#foundation/filesystem/index";
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
  layout,
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
  layout?: Layout | undefined;
}): Promise<{
  readonly structure: Omit<
    EnvironmentStructure,
    "unreached" | "diagnostics" | "entries"
  >;
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const { strictness, namespaces } = options;
  const group = layout?.nature === "recursive";
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
    group,
    indexFile,
    entryFile,
    internals,
    rolesFor,
    report,
  });

  const walk = createStructureWalker({
    filesystem,
    options,
    group,
    layoutEntries: layout?.nature === "static" ? layout.entries : undefined,
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

  if (layout?.nature === "static") {
    const present = new Set(children.map((child) => child.name));

    for (const child of children) {
      if (getOwn(layout.entries, child.name) === undefined) {
        report(
          freeze({
            severity: "error",
            code: "unlisted-layout-entry",
            message: `${child.path} is no entry of the ${layout.name} layout of ${name}: ${keys(layout.entries).join(", ")}`,
            blocking: true,
            environment: name,
            files: freeze([]),
          }),
        );
      }
    }

    for (const [entry, { required }] of entries(layout.entries)) {
      if (required === true && !present.has(entry)) {
        report(
          freeze({
            severity: "error",
            code: "missing-layout-entry",
            message: `${name} lacks ${entry}, a required entry of its ${layout.name} layout`,
            blocking: true,
            environment: name,
            files: freeze([]),
          }),
        );
      }
    }
  }

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
    ...(group ? { group: true as const } : {}),
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
    ? loosenStructureNode(
        collectedRoot,
        layout?.nature === "derived" ? "mirror" : "domain",
      )
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
      ...(layout === undefined ? {} : { layout }),
      root: rootNode,
      unclassified: collectStructureNodes(rootNode).filter(
        ({ kind }) => kind === "unclassified",
      ),
      roles: structureRoles,
    }),
    diagnostics: freeze(sorted),
  });
}
