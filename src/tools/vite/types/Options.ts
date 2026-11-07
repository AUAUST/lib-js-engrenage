import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/vite/config/schemas/optionsSchema";

export type Options = InferInput<typeof optionsSchema>;
