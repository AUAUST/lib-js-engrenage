import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/eslint/config/schemas/optionsSchema";

export type Options = InferInput<typeof optionsSchema>;
