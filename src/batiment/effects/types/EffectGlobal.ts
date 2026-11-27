import type { InferOutput } from "valibot";

import type { effectGlobalSchema } from "#batiment/effects/config/schemas/effectGlobalSchema";

/**
 * The rank of a name the host provides: its own, or the entry of the unit, or
 * the member of it, it stands for.
 */
export type EffectGlobal = InferOutput<typeof effectGlobalSchema>;
