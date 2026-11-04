import { matchesGlob } from "node:path";

import { wrap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import type { ProjectConfig } from "#project/config/index";
import type { StructureLocation } from "#tools/eslint/types/StructureLocation";

export function findLocatedRole(
  config: ProjectConfig,
  { environment, node, relativePath }: StructureLocation,
): { name: string; effects: string | undefined } | undefined {
  if (node.kind === "role") {
    return node.role === undefined
      ? undefined
      : { name: node.role, effects: node.effects };
  }

  if (relativePath.includes("/")) {
    return;
  }

  const found = entries(config[environment].roles.roles).find(
    ([, { file }]) => {
      return wrap(file ?? []).some((glob) => matchesGlob(relativePath, glob));
    },
  );

  return found === undefined
    ? undefined
    : { name: found[0], effects: found[1].effects };
}
