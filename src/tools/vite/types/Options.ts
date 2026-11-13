import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/vite/config/schemas/optionsSchema";

/**
 * Options of `defineViteConfig`: `test` is a config, or a function of the loaded
 * config and config env, merged before the native configs.
 */
export type Options = InferInput<typeof optionsSchema>;
