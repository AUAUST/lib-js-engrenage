import { isDeepStrictEqual } from "node:util";

import { isFunction } from "@auaust/toolkit/isFunction";
import { entries } from "@auaust/toolkit/object";

import {
  defaultEffectLevels,
  effectLevelPurposes,
} from "#project/structure/constants";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";

interface RoleRow {
  name: string;
  contract: ResolvedRoleContract;
  environments: string[];
}

function code(value: string): string {
  return `\`${value}\``;
}

function renderExports({
  exports: { values, types },
  index,
  subpath,
  reexport,
}: ResolvedRoleContract): string {
  return [
    values === undefined ? undefined : `values ${code(values)}`,
    types === undefined ? undefined : `types ${code(types)}`,
    index ? code("index") : undefined,
    subpath === "root"
      ? `subpath ${code(subpath)}`
      : subpath
        ? code("subpath")
        : undefined,
    reexport === undefined
      ? undefined
      : `reexport ${reexport.map(code).join("/")}`,
  ]
    .filter((value) => value !== undefined)
    .join(", ");
}

export function renderProjectMapRoles(
  structure: ResolvedStructure,
  roles: Readonly<Partial<Record<string, ResolvedRoles>>>,
): string[] {
  const rows: RoleRow[] = [];

  for (const [environment, resolved] of entries(roles)) {
    if (structure[environment] === undefined) {
      continue;
    }

    const candidates = [
      ...entries(resolved?.roles ?? {}),
      ...entries(structure[environment]?.roles ?? {}).map(([name, role]) => {
        return [name, role.contract] as const;
      }),
    ];

    for (const [name, contract] of candidates) {
      const existing = rows.find((row) => {
        return row.name === name && isDeepStrictEqual(row.contract, contract);
      });

      if (existing === undefined) {
        rows.push({
          name,
          contract,
          environments: [environment],
        });
      } else if (!existing.environments.includes(environment)) {
        existing.environments.push(environment);
      }
    }
  }

  return [
    "",
    "## Roles",
    "",
    `Effect levels, purest first: ${defaultEffectLevels.map(code).join(" < ")}. A role with a level imports at runtime only roles of its level or a purer one. Global roles import each other, and domains only with \`import type\`. Other domains import a \`collected\` role's modules inside sub-domains too, past their parent domains' surfaces.`,
    "",
    ...defaultEffectLevels.map((level) => {
      return `- ${code(level)}: ${effectLevelPurposes[level]}`;
    }),
    "",
    "| Role | Purpose | Files | Companions | Exports | Level | Imports | Environments |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map(({ name, contract, environments }) => {
      const files = isFunction(contract.file)
        ? code(contract.fileDescription ?? "")
        : listStaticFileGlobs(contract.file).map(code).join(", ");

      const companions = contract.companionsDescription === undefined
        ? ""
        : code(contract.companionsDescription);

      const imports = [
        contract.typeOnly ? "type-only" : undefined,
        contract.public ? "public" : undefined,
        contract.collected ? "collected" : undefined,
      ]
        .filter((value) => value !== undefined)
        .join(", ");

      const purpose = (contract.purpose ?? "").replaceAll("|", String.raw`\|`);

      return `| ${code(name)} | ${purpose} | ${files} | ${companions} | ${renderExports(contract)} | ${contract.effects ?? ""} | ${imports} | ${environments.map(code).join(", ")} |`;
    }),
  ];
}
