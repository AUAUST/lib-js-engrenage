import type { EffectGlobals } from "#batiment/effects/index";

/**
 * The globals an environment's host provides: the names its global object goes
 * by besides `globalThis`, and their ranks, first source first.
 */
export interface EnvironmentGlobals {
  readonly aliases: readonly string[];
  readonly ranks: readonly EffectGlobals[];
}
