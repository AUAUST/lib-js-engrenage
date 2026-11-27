import { freeze } from "@auaust/toolkit/object";
import type { DeepReadonly } from "@auaust/toolkit/types";

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
