/**
 * What a call must meet for a price tier to apply: the `speed` it ran at,
 * `standard` when unset, and a context above `contextAbove` tokens when set.
 */
export interface TierCondition {
  readonly speed?: string;
  readonly contextAbove?: number;
}
