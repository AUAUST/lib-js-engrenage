/**
 * What a member path costs: `level` to invoke it, its member's rank else its
 * unit's; `member` to read it, the rank of the longest ranked member path starting
 * it, `undefined` when none ranks it.
 */
export interface MemberRank {
  readonly level: string | undefined;
  readonly member: string | undefined;
}
