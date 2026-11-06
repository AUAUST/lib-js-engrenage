import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/tsdown/config/optionsSchema";

export type Options = InferInput<typeof optionsSchema>;
