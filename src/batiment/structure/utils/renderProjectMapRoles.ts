import { isDeepStrictEqual } from "node:util";

import { toArray } from "@auaust/toolkit/array";
import { entries } from "@auaust/toolkit/object";

import {
  defaultEffectLevels,
  effectLevelPurposes,
} from "#batiment/roles/constants";
import { renderPurpose } from "#batiment/structure/utils/renderPurpose";
import type {
  ResolvedRoleContract,
  ResolvedRoles,
} from "#batiment/roles/index";
import type { ResolvedStructure } from "#batiment/structure/types/ResolvedStructure";

interface RoleRow {
  name: string;
  contract: ResolvedRoleContract;
  namespaces: string[];
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
    index === "root"
      ? `index ${code(index)}`
      : index
        ? code("index")
        : undefined,
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

  for (const [namespace, resolved] of entries(roles)) {
    if (structure[namespace] === undefined) {
      continue;
    }

    const candidates = [
      ...entries(resolved?.roles ?? {}),
      ...entries(structure[namespace]?.roles ?? {}).map(([name, role]) => {
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
          namespaces: [namespace],
        });
      } else if (!existing.namespaces.includes(namespace)) {
        existing.namespaces.push(namespace);
      }
    }
  }

  return [
    "",
    "## Roles",
    "",
    `Effect levels, purest first: ${defaultEffectLevels.map(code).join(" < ")}. A role with a level imports at runtime only roles of its level or a purer one. Global roles import each other, and domains only with \`import type\`. Other domains import a role's modules one by one only when it is \`public\`, otherwise only through its domain's index. They import a \`collected\` role's modules inside sub-domains too, past their parent domains' surfaces, and a \`modules\` role's directly; no index lists them.`,
    "",
    ...defaultEffectLevels.map((level) => {
      return `- ${code(level)}: ${effectLevelPurposes[level]}`;
    }),
    "",
    "| Role | Purpose | Files | Companions | Exports | Level | Imports | Namespaces |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map(({ name, contract, namespaces }) => {
      const files = toArray(contract.file ?? [])
        .map(code)
        .join(", ");

      const companions = toArray(contract.companions ?? [])
        .map(code)
        .join(", ");

      const imports = [
        contract.typeOnly ? "type-only" : undefined,
        contract.public ? "public" : undefined,
        contract.collected ? "collected" : undefined,
        contract.surface === "modules" ? "modules" : undefined,
      ]
        .filter((value) => value !== undefined)
        .join(", ");

      const purpose = renderPurpose(contract);

      return `| ${code(name)} | ${purpose} | ${files} | ${companions} | ${renderExports(contract)} | ${contract.effects ?? ""} | ${imports} | ${namespaces.map(code).join(", ")} |`;
    }),
  ];
}
