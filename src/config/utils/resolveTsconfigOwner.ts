import { entries } from "@auaust/toolkit/object";

import { defaultTsconfigInherits } from "#config/constants";
import type { EnvironmentTsconfig } from "#config/types/EnvironmentTsconfig";
import type { TsconfigGroups } from "#config/types/TsconfigGroups";
import type { TsconfigKey } from "#config/types/TsconfigKey";

function describe(key: TsconfigKey): string {
  return `${key}.tsconfig`;
}

function readGroup(
  key: TsconfigKey,
  groups: TsconfigGroups,
): EnvironmentTsconfig | false {
  const group = groups[key];

  if (group !== undefined) {
    return group;
  }

  return key in defaultTsconfigInherits
    ? {
        inherits:
          defaultTsconfigInherits[key as keyof typeof defaultTsconfigInherits],
      }
    : {};
}

export function resolveTsconfigOwner(
  key: TsconfigKey,
  groups: TsconfigGroups,
): TsconfigKey | undefined {
  const chain: TsconfigKey[] = [];

  let current = key;

  for (;;) {
    chain.push(current);

    const group = readGroup(current, groups);

    if (group === false) {
      if (current === key) {
        return undefined;
      }

      throw new Error(
        `${describe(chain.at(-2)!)} inherits ${current}, which has no managed tsconfig`,
      );
    }

    const { inherits, ...others } = group;

    if (inherits === undefined) {
      return current;
    }

    const conflicting = entries(others)
      .filter(([, value]) => value !== undefined)
      .map(([option]) => option);

    if (conflicting.length > 0) {
      throw new Error(
        `${describe(current)} inherits ${inherits} and cannot also set ${conflicting.join(", ")}`,
      );
    }

    if (chain.includes(inherits)) {
      throw new Error(
        `${describe(key)} inherits in a cycle: ${[...chain, inherits].join(" → ")}`,
      );
    }

    current = inherits;
  }
}
