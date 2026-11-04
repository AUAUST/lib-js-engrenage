import { freeze } from "@auaust/toolkit/object";

import type { Trait } from "#project/presets/types/Trait";

export const traits = freeze(["published"] as const);

export const presetTraits = freeze({
  library: freeze(["published"] as const),
} as const) satisfies Record<string, readonly Trait[]>;
