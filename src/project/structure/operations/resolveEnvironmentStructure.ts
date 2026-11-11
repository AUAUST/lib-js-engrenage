import { basename } from "node:path";

import { flat } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { createStructureDomainResolver } from "#project/structure/operations/createStructureDomainResolver";
import { createStructureRoleResolver } from "#project/structure/operations/createStructureRoleResolver";
import { createStructureWalker } from "#project/structure/operations/createStructureWalker";
import { collectStructureNodes } from "#project/structure/utils/collectStructureNodes";
import { createMirrorClassifier } from "#project/structure/utils/createMirrorClassifier";
import { getEntryFile } from "#project/structure/utils/getEntryFile";
import { getIndexFile } from "#project/structure/utils/getIndexFile";
import { listStructureRoles } from "#project/structure/utils/listStructureRoles";
import { loosenStructureNode } from "#project/structure/utils/loosenStructureNode";
import type { Filesystem } from "#foundation/filesystem/index";
import type { EnvironmentRoles } from "#project/structure/types/EnvironmentRoles";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ProgramLayout } from "#project/structure/types/ProgramLayout";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleRegistry } from "#project/structure/types/RoleRegistry";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { TestsContext } from "#project/structure/types/TestsContext";
import type { Directories } from "#types/Directories";

const environmentRoot = ".";
const projectRoot = ".";

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
}): Promise<EnvironmentStructure> {
  const { strictness, namespaces } = options;
  const commands = tree === "commands";

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
    filesystem,
    options,
    commands,
    indexFile,
    entryFile,
    internals,
    rolesFor,
  });

  const walk = createStructureWalker({
    name,
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
          scopes: rootScopes,
          owned: rootScopes,
          structured: false,
          lineage: freeze([
            freeze({
              name: basename(directory),
              path: directory,
              kind: "namespace" as const,
            }),
          ]),
          enclosing: [],
        });
      }),
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
    ...(rootDeclaration?.purpose === undefined
      ? {}
      : { purpose: rootDeclaration.purpose }),
    children,
  });

  const structureRoles = listStructureRoles(
    resolvedRoot,
    walked.map((directory) => {
      return { directory, roles: rolesFor(rootScopes) };
    }),
    rolesIn,
  );

  const rootNode = strictness === "loose"
    ? loosenStructureNode(resolvedRoot, name === "tests" ? "mirror" : "domain")
    : resolvedRoot;

  return freeze({
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
  });
}
