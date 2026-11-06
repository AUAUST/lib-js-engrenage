import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/vite/config/optionsSchema";

export type Options = InferInput<typeof optionsSchema>;
