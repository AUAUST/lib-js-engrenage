import { entries } from "@auaust/toolkit/object";

import { entryRoleName, indexRoleName } from "#project/roles/constants";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import { renderStructureTree } from "#project/structure/utils/renderStructureTree";
import type { Alias } from "#project/structure/types/Alias";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";

// @debt map renderers repeat code and list text formatting helpers
function code(value: string): string {
  return `\`${value}\``;
}

function list(values: readonly string[]): string {
  return values.map(code).join(", ");
}

export function renderEnvironmentMap({
  name,
  environment,
  roles,
  aliases,
}: {
  name: string;
  environment: EnvironmentStructure;
  roles: ResolvedRoles | undefined;
  aliases: readonly Alias[];
}): string {
  const { root } = environment;

  const globalRoles = [
    ...root.children
      .filter((child) => child.kind === "role")
      .map(({ name: role }) => role),
    ...entries(roles?.roles ?? {}).flatMap(([role, contract]) => {
      return role === indexRoleName || role === entryRoleName || contract.scoped
        ? []
        : listStaticFileGlobs(contract.file);
    }),
  ];

  const tree = renderStructureTree({
    environment,
    aliases,
    globalRoles,
  });

  return [
    `# Project map: ${name}`,
    "",
    ...(environment.strictness === "loose"
      ? ["Strictness: loose, unclassified directories are plain domains.", ""]
      : []),
    "```",
    ...tree,
    "```",
    ...(environment.unclassified.length === 0
      ? []
      : [
          "",
          `Unclassified: ${list(
            environment.unclassified.map(({ path }) => {
              return path;
            }),
          )}`,
        ]),
    ...(name === "bin" && root.commands === true
      ? [
          "",
          "Commands: one directory per command group, whose `index.ts` names its subcommands and their aliases; the root group's `executable.ts` runs it; each other module is one command.",
        ]
      : []),
  ].join("\n");
}
