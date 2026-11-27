import type { EffectState } from "#batiment/effects/types/EffectState";

/**
 * State an operation reads or writes, by who owns it.
 */
export interface StateTarget {
  readonly state: EffectState;
}
