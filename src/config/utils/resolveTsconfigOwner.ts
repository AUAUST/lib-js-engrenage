import type { TsconfigGroups } from "#config/types/TsconfigGroups";
import type { TsconfigKey } from "#config/types/TsconfigKey";
import type { TsconfigOwner } from "#config/types/TsconfigOwner";

export function resolveTsconfigOwner(
  key: TsconfigKey,
  groups: TsconfigGroups,
): TsconfigOwner | undefined {
  const chain: TsconfigKey[] = [];

  let current = key;
  let previous: TsconfigKey | undefined;

  for (;;) {
    chain.push(current);

    const group = groups[current];

    if (!group.enabled) {
      if (previous === undefined) {
        return;
      }

      throw new Error(
        `${previous}.tsconfig inherits ${current}, which has no managed tsconfig`,
      );
    }

    const { inherits } = group;

    if (inherits === undefined) {
      return { key: current, group };
    }

    if (chain.includes(inherits)) {
      throw new Error(
        `${key}.tsconfig inherits in a cycle: ${[...chain, inherits].join(" → ")}`,
      );
    }

    previous = current;
    current = inherits;
  }
}
