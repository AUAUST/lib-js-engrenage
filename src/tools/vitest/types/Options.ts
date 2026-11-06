import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/vitest/config/optionsSchema";

export type Options = InferInput<typeof optionsSchema>;
