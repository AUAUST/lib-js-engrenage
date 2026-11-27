import { freeze } from "@auaust/toolkit/object";
import type { DeepReadonly } from "@auaust/toolkit/types";

import type { ResolvedEffects } from "#batiment/effects/types/ResolvedEffects";

export const defaultEffectLevels = freeze([
  "pure",
  "confined",
  "observing",
  "effectful",
] as const);

export const effectLevelPurposes = freeze({
  pure: "Compute from arguments only, without observable changes.",
  confined: "Mutate caller-owned values or maintain a private memo cache.",
  observing: "Read the context or write diagnostics without changing state later operations read.",
  effectful: "Change state later operations can read, including staged writes and spawned processes.",
}) satisfies Readonly<Record<(typeof defaultEffectLevels)[number], string>>;

export const noEffects = freeze({
  levels: defaultEffectLevels,
  purposes: effectLevelPurposes,
  ranks: freeze([]),
  fallback: undefined,
}) satisfies DeepReadonly<ResolvedEffects>;
