import type { InferInput } from "valibot";

import type { optionsSchema } from "#vitest/config/schemas/optionsSchema";

export type Options = InferInput<typeof optionsSchema>;
