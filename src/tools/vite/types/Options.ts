import type { InferInput } from "valibot";

import type { optionsSchema } from "#vite/config/schemas/optionsSchema";

export type Options = InferInput<typeof optionsSchema>;
