import type { optionsSchema } from "#eslint/config/schemas/optionsSchema";
import type { InferInput } from "valibot";

export type Options = InferInput<typeof optionsSchema>;
