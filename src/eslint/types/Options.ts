import type { InferInput } from "valibot";

import type { optionsSchema } from "#eslint/config/schemas/optionsSchema";

export type Options = InferInput<typeof optionsSchema>;
