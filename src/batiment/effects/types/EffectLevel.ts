import type { InferOutput } from "valibot";

import type { effectLevelSchema } from "#batiment/effects/config/schemas/effectLevelSchema";

export type EffectLevel = InferOutput<typeof effectLevelSchema>;
