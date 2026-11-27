import { unique } from "@auaust/toolkit/iterable";
import { entries } from "@auaust/toolkit/object";
import { capitalize } from "@auaust/toolkit/string";

import { entryRoleName, indexRoleName } from "#batiment/roles/constants";
import { listStaticFileGlobs, type ResolvedRoles } from "#batiment/roles/index";
import { createStructureTree } from "#batiment/structure/utils/createStructureTree";
import { listNamespaceDirectories } from "#batiment/structure/utils/listNamespaceDirectories";
import { renderDenseEntry } from "#nexus/reports/index";
import type { Alias } from "#batiment/structure/types/Alias";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { StructureNode } from "#batiment/structure/types/StructureNode";
import type { Directory } from "#types/Directory";

// @debt map renderers repeat code and list text formatting helpers
function code(value: string): string {
  return `\`${value}\``;
}

function list(values: readonly string[]): string {
  return values.map(code).join(", ");
}

function listGlobalRoles(
  node: StructureNode,
  roles: ResolvedRoles | undefined,
): readonly string[] {
  return [
    ...unique(
      node.children
        .filter((child) => child.kind === "role")
        .map(({ name: role }) => role),
    ),
    ...entries(roles?.roles ?? {}).flatMap(([role, contract]) => {
      return role === indexRoleName || role === entryRoleName || contract.optIn
        ? []
        : listStaticFileGlobs(contract.file);
    }),
  ];
}

export function renderNamespaceMap({
  name,
  namespace,
  roles,
  directoryRoles,
  aliases,
}: {
  name: string;
  namespace: NamespaceStructure;
  roles: ResolvedRoles | undefined;
  directoryRoles: ReadonlyMap<Directory, ResolvedRoles>;
  aliases: readonly Alias[];
}): string {
  const { root, layout } = namespace;

  // @debt "global roles" mixes role directories present at the root with file roles allowed there
  const globalRoles = new Map(
    listNamespaceDirectories(namespace).map(({ directory, node }) => {
      return [
        node,
        listGlobalRoles(
          node,
          node === root ? roles : directoryRoles.get(directory),
        ),
      ] as const;
    }),
  );

  const tree = renderDenseEntry(
    createStructureTree({
      namespace,
      aliases,
      globalRoles,
    }),
  );

  return [
    `# Project map: ${name}`,
    "",
    ...(namespace.strictness === "loose"
      ? ["Strictness: loose, unclassified directories are plain domains.", ""]
      : []),
    "```",
    ...tree,
    "```",
    ...(namespace.unclassified.length === 0
      ? []
      : [
          "",
          `Unclassified: ${list(
            namespace.unclassified.map(({ path }) => {
              return path;
            }),
          )}`,
        ]),
    ...(layout?.nature === "recursive" && root.group === true
      ? ["", `${capitalize(layout.name)}: ${layout.node.description}`]
      : []),
  ].join("\n");
}
