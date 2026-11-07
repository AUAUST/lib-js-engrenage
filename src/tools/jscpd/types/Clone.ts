import type { CloneFragment } from "#tools/jscpd/types/CloneFragment";

export interface Clone {
  readonly lines: number;
  readonly fragments: readonly [CloneFragment, CloneFragment];
}
