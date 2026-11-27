import type { RankedTarget } from "#batiment/effects/types/RankedTarget";
import type { StateTarget } from "#batiment/effects/types/StateTarget";

/**
 * What an operation applies to: a ranked unit or member, or state.
 */
export type EffectTarget = RankedTarget | StateTarget;
