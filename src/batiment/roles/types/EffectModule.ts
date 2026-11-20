import type { InferOutput } from "valibot";

import type { effectModuleSchema } from "#batiment/roles/config/schemas/effectModuleSchema";

export type EffectModule = InferOutput<typeof effectModuleSchema>;
