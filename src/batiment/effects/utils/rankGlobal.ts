import { isString } from "@auaust/toolkit";
import { getOwn } from "@auaust/toolkit/object";

import { rankMember } from "#batiment/effects/utils/rankMember";
import type { EffectGlobal } from "#batiment/effects/types/EffectGlobal";
import type { EffectGlobals } from "#batiment/effects/types/EffectGlobals";
import type { MemberRank } from "#batiment/effects/types/MemberRank";
import type { ResolvedEffects } from "#batiment/effects/types/ResolvedEffects";

function rankEntry(
  effects: ResolvedEffects,
  key: string,
  entry: EffectGlobal,
  rest: readonly string[],
): MemberRank {
  if (isString(entry) || !("unit" in entry)) {
    return rankMember(
      {
        ...effects,
        ranks: [{ [key]: entry }],
        fallback: undefined,
      },
      key,
      rest,
    );
  }

  return rankMember(effects, entry.unit, [
    ...(entry.member === undefined ? [] : entry.member.split(".")),
    ...rest,
  ]);
}

/**
 * Ranks the member path `path` of a name a host provides by the longest name
 * or member path `globals` key that starts it, the first source keying it
 * winning; a key naming a member path ranks reading it too. `undefined` when
 * no source ranks its name.
 */
export function rankGlobal(
  effects: ResolvedEffects,
  globals: readonly EffectGlobals[],
  path: readonly string[],
): MemberRank | undefined {
  for (let length = path.length; length > 0; length -= 1) {
    const key = path.slice(0, length).join(".");

    for (const source of globals) {
      const entry = getOwn(source, key);

      if (entry === undefined) {
        continue;
      }

      const ranked = rankEntry(effects, key, entry, path.slice(length));

      return length === 1
        ? ranked
        : { level: ranked.level, member: ranked.member ?? ranked.level };
    }
  }
}
