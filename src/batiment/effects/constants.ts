import { freeze } from "@auaust/toolkit/object";
import type { DeepReadonly } from "@auaust/toolkit/types";

import type { EffectPosition } from "#batiment/effects/types/EffectPosition";
import type { EffectState } from "#batiment/effects/types/EffectState";
import type { ResolvedEffects } from "#batiment/effects/types/ResolvedEffects";

export const defaultEffectLevels = freeze([
  "pure",
  "printing",
  "confined",
  "observing",
  "effectful",
] as const);

export const effectLevelPurposes = freeze({
  pure: "Compute from arguments only, without observable changes.",
  printing: "Do what `pure` does, and append to an output channel the runtime gives the program no way to read: the console, stdout or stderr.",
  confined: "Do what `printing` does, and mutate values the caller owns, as created or received by it, or keep a memo cache no caller can observe, holding values callers do not mutate.",
  observing: "Do what `confined` does, and read state that changes between calls, the clock or randomness, or observe garbage collection.",
  effectful: "Do what `observing` does, and change state later operations can read, including staged writes, spawned processes and scheduled work: timers, microtasks and finalization callbacks.",
}) satisfies Readonly<Record<(typeof defaultEffectLevels)[number], string>>;

export const noEffects = freeze({
  levels: defaultEffectLevels,
  purposes: effectLevelPurposes,
  ranks: freeze([]),
  fallback: undefined,
}) satisfies DeepReadonly<ResolvedEffects>;

/**
 * The level reading or writing state charges, by who owns it and the position
 * running the operation; nothing where none is listed. Reads apply to
 * reassignable bindings only.
 */
export const stateLevels: Readonly<
  Record<
    "read" | "write",
    Readonly<
      Partial<
        Record<
          EffectState,
          Readonly<
            Partial<
              Record<EffectPosition, (typeof defaultEffectLevels)[number]>
            >
          >
        >
      >
    >
  >
> = freeze({
  read: freeze({
    "closure": freeze({ evaluation: "observing", invocation: "observing" }),
    "unit-private": freeze({ invocation: "observing" }),
    "unit-shared": freeze({ invocation: "observing" }),
  }),
  write: freeze({
    "received": freeze({ evaluation: "confined", invocation: "confined" }),
    "closure": freeze({ evaluation: "confined", invocation: "confined" }),
    "unit-private": freeze({ invocation: "confined" }),
    "unit-shared": freeze({ invocation: "effectful" }),
    "external": freeze({ evaluation: "effectful", invocation: "effectful" }),
  }),
});
