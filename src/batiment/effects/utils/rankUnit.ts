import { matchesGlob } from "node:path";

import { isString } from "@auaust/toolkit";
import { entries, getOwn, keys } from "@auaust/toolkit/object";

import type { EffectRank } from "#batiment/effects/types/EffectRank";
import type { EffectRanks } from "#batiment/effects/types/EffectRanks";
import type { ResolvedEffects } from "#batiment/effects/types/ResolvedEffects";
import type { UnitRank } from "#batiment/effects/types/UnitRank";

function findRank(ranks: EffectRanks, unit: string): EffectRank | undefined {
  const exact = getOwn(ranks, unit);

  if (exact !== undefined) {
    return exact;
  }

  const pattern = keys(ranks).find((glob) => matchesGlob(unit, glob));

  return pattern === undefined ? undefined : getOwn(ranks, pattern);
}

/**
 * Ranks `unit` from the first source ranking it, an exact key before any glob,
 * else `fallback`; each member takes the rank of the first source listing it,
 * whatever source ranks the unit. A ranked unit evaluates at the first source's
 * `evaluation` stating one, else at the purest level.
 */
export function rankUnit(
  { levels, ranks, fallback }: ResolvedEffects,
  unit: string,
): UnitRank {
  const members = new Map<string, string>();

  let level: string | undefined;
  let evaluation: string | undefined;

  for (const source of ranks) {
    const rank = findRank(source, unit);

    if (rank === undefined) {
      continue;
    }

    level ??= isString(rank) ? rank : rank.level;

    if (isString(rank)) {
      continue;
    }

    evaluation ??= rank.evaluation;

    for (const [member, memberLevel] of entries(rank.symbols ?? {})) {
      if (!members.has(member)) {
        members.set(member, memberLevel);
      }
    }
  }

  return level === undefined
    ? {
        level: fallback,
        evaluation: fallback,
        members,
      }
    : {
        level,
        evaluation: evaluation ?? levels[0],
        members,
      };
}
