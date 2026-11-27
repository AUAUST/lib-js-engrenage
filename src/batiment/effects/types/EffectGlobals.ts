import type { EffectGlobal } from "#batiment/effects/types/EffectGlobal";

/**
 * Ranks of the names a host provides, keyed by name or member path.
 */
export type EffectGlobals = Readonly<Record<string, EffectGlobal>>;
