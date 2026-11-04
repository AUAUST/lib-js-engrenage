import type { InferInput } from "valibot";

import type { optionsSchema } from "#tsdown/config/schemas/optionsSchema";

export type Options = InferInput<typeof optionsSchema>;
