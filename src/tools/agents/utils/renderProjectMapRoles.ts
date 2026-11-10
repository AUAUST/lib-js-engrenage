import { isDeepStrictEqual } from "node:util";

import { isFunction } from "@auaust/toolkit/isFunction";
import { entries } from "@auaust/toolkit/object";

import {
  defaultEffectLevels,
  effectLevelPurposes,
} from "#project/structure/constants";
import {
  listStaticFileGlobs,
  type ResolvedRoleContract,
  type ResolvedRoles,
  type ResolvedStructure,
} from "#project/structure/index";

interface RoleRow {
  name: string;
  contract: ResolvedRoleContract;
  environments: string[];
}

function code(value: string): string {
  return `\`${value}\``;
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
    `Effect levels, purest first: ${defaultEffectLevels.map(code).join(" < ")}. A role with a level imports at runtime only roles of its level or a purer one. Global roles import only each other. Other domains import a \`collected\` role's modules inside sub-domains too, past their parent domains' surfaces.`,
    "",
    ...defaultEffectLevels.map((level) => {
      return `- ${code(level)}: ${effectLevelPurposes[level]}`;
    }),
    "",
    "| Role | Purpose | Files | Level | Imports | Environments |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows.map(({ name, contract, environments }) => {
      const files = isFunction(contract.file)
        ? code(contract.fileDescription ?? "")
        : listStaticFileGlobs(contract.file).map(code).join(", ");

      const imports = [
        contract.typeOnly ? "type-only" : undefined,
        contract.public ? "public" : undefined,
        contract.collected ? "collected" : undefined,
      ]
        .filter((value) => value !== undefined)
        .join(", ");

      const purpose = (contract.purpose ?? "").replaceAll("|", String.raw`\|`);

      return `| ${code(name)} | ${purpose} | ${files} | ${contract.effects ?? ""} | ${imports} | ${environments.map(code).join(", ")} |`;
    }),
  ];
}
