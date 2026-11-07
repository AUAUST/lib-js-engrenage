import type { InferOutput } from "valibot";

import type { effectModuleSchema } from "#project/structure/config/schemas/effectModuleSchema";

export type EffectModule = InferOutput<typeof effectModuleSchema>;
