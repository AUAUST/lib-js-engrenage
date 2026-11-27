import { isString } from "@auaust/toolkit";
import {
  entries,
  freeze,
  getOwn,
  record,
  values,
} from "@auaust/toolkit/object";

import {
  defaultEffectLevels,
  effectLevelPurposes,
} from "#batiment/effects/constants";
import type { EffectLevel } from "#batiment/effects/types/EffectLevel";
import type { EffectRanks } from "#batiment/effects/types/EffectRanks";
import type { ResolvedEffects } from "#batiment/effects/types/ResolvedEffects";

function describeLevel(level: EffectLevel): readonly [string, string] {
  if (!isString(level)) {
    return [level.name, level.purpose];
  }

  const purpose = getOwn(effectLevelPurposes, level);

  if (purpose === undefined) {
    throw new Error(
      `The effect level ${level} is not one of ${defaultEffectLevels.join(", ")}, so it needs a purpose`,
    );
  }

  return [level, purpose];
}

/**
 * Resolves the configured effect levels and ranks over the `defaults` ranks,
 * checking every level they state against the scale once.
 */
export function resolveEffects({
  levels: declared = defaultEffectLevels,
  ranks,
  defaults,
  fallback,
}: {
  levels?: readonly EffectLevel[] | undefined;
  ranks?: EffectRanks | undefined;
  defaults?: EffectRanks | undefined;
  fallback?: string | undefined;
}): ResolvedEffects {
  const described = declared.map(describeLevel);
  const purposes = record(described);
  const levels = described.map(([name]) => name);

  const sources = [ranks, defaults].filter((source) => {
    return source !== undefined;
  });

  function assertLevel(level: string, subject: string) {
    if (!levels.includes(level)) {
      throw new Error(
        `${subject} is ranked ${level}, which is not one of the effect levels ${levels.join(", ")}`,
      );
    }
  }

  if (fallback !== undefined) {
    assertLevel(fallback, "The fallback");
  }

  for (const source of sources) {
    for (const [pattern, rank] of entries(source)) {
      if (isString(rank)) {
        assertLevel(rank, `The unit ${pattern}`);

        continue;
      }

      assertLevel(rank.level, `The unit ${pattern}`);

      for (const level of values(rank.symbols)) {
        assertLevel(level, `A symbol of ${pattern}`);
      }
    }
  }

  return freeze({
    levels: freeze(levels),
    purposes: freeze(purposes),
    ranks: freeze(sources),
    fallback,
  });
}
