import { rankUnit } from "#batiment/effects/utils/rankUnit";
import type { MemberRank } from "#batiment/effects/types/MemberRank";
import type { ResolvedEffects } from "#batiment/effects/types/ResolvedEffects";

/**
 * Ranks the member `path` of `unit` by the longest member path its ranks key
 * that starts it, else by its unit's rank.
 */
export function rankMember(
  effects: ResolvedEffects,
  unit: string,
  path: readonly string[],
): MemberRank {
  const { level, members } = rankUnit(effects, unit);

  for (let length = path.length; length > 0; length -= 1) {
    const member = members.get(path.slice(0, length).join("."));

    if (member !== undefined) {
      return { level: member, member };
    }
  }

  return { level, member: undefined };
}
