import { unique } from "@auaust/toolkit/iterable";
import { entries } from "@auaust/toolkit/object";
import { capitalize } from "@auaust/toolkit/string";

import { entryRoleName, indexRoleName } from "#batiment/roles/constants";
import { listStaticFileGlobs, type ResolvedRoles } from "#batiment/roles/index";
import { listNamespaceDirectories } from "#batiment/structure/utils/listNamespaceDirectories";
import { renderStructureTree } from "#batiment/structure/utils/renderStructureTree";
import type { Alias } from "#batiment/structure/types/Alias";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";

// @debt map renderers repeat code and list text formatting helpers
function code(value: string): string {
  return `\`${value}\``;
}

function list(values: readonly string[]): string {
  return values.map(code).join(", ");
}

export function renderNamespaceMap({
  name,
  namespace,
  roles,
  aliases,
}: {
  name: string;
  namespace: NamespaceStructure;
  roles: ResolvedRoles | undefined;
  aliases: readonly Alias[];
}): string {
  const { root, layout } = namespace;

  // @debt "global roles" mixes role directories present at the root with file roles allowed there
  const globalRoles = [
    ...unique(
      listNamespaceDirectories(namespace).flatMap(({ node }) => {
        return node.children
          .filter((child) => child.kind === "role")
          .map(({ name: role }) => role);
      }),
    ),
    ...entries(roles?.roles ?? {}).flatMap(([role, contract]) => {
      return role === indexRoleName || role === entryRoleName || contract.optIn
        ? []
        : listStaticFileGlobs(contract.file);
    }),
  ];

  const tree = renderStructureTree({
    namespace,
    aliases,
    globalRoles,
  });

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
