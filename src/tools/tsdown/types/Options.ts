import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/tsdown/config/schemas/optionsSchema";

/**
 * Options of `defineTsdownConfig`: `bundle` lists the dependencies to bundle,
 * replacing the package's `inlinedDependencies`, and `plugins` switches
 * engrenage's built-in plugins, each enabled by default.
 */
export type Options = InferInput<typeof optionsSchema>;
