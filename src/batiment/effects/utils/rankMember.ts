import { rankUnit } from "#batiment/effects/utils/rankUnit";
import type { ResolvedEffects } from "#batiment/effects/types/ResolvedEffects";

/**
 * Ranks `member` of `unit` by its own rank, else by its unit's.
 */
export function rankMember(
  effects: ResolvedEffects,
  unit: string,
  member: string,
): string | undefined {
  const { level, members } = rankUnit(effects, unit);

  return members.get(member) ?? level;
}
