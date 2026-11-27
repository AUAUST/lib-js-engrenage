import type { InferOutput } from "valibot";

import type { effectRankSchema } from "#batiment/effects/config/schemas/effectRankSchema";

export type EffectRank = InferOutput<typeof effectRankSchema>;
