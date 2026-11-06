import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/eslint/config/optionsSchema";

export type Options = InferInput<typeof optionsSchema>;
