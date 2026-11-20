import { entries } from "@auaust/toolkit/object";

import { entryRoleName, indexRoleName } from "#batiment/roles/constants";
import { listStaticFileGlobs, type ResolvedRoles } from "#batiment/roles/index";
import { renderStructureTree } from "#project/structure/utils/renderStructureTree";
import type { EnvironmentStructure } from "#batiment/structure/index";
import type { Alias } from "#project/structure/types/Alias";

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

  // @debt "global roles" mixes role directories present at the root with file roles allowed there
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
