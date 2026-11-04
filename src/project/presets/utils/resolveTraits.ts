import { includes } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { presetTraits, traits } from "#project/presets/constants";
import type { Preset } from "#project/presets/types/Preset";
import type { ResolvedTraitAdjustments } from "#project/presets/types/ResolvedTraitAdjustments";
import type { ResolvedTraits } from "#project/presets/types/ResolvedTraits";
import type { Trait } from "#project/presets/types/Trait";

export function resolveTraits(
  preset: Preset | undefined,
  { enable, disable }: ResolvedTraitAdjustments,
): ResolvedTraits {
  const bundled: readonly Trait[] =
    preset === undefined ? [] : presetTraits[preset];

  const resolved = {} as Record<Trait, boolean>;

  for (const trait of traits) {
    resolved[trait] =
      includes(enable, trait) ||
      (includes(bundled, trait) && !includes(disable, trait));
  }

  return freeze(resolved);
}
