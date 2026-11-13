import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/vitest/config/schemas/optionsSchema";

/**
 * Options of `defineVitestConfig`. `isolate` defaults to `false`, `restoreMocks`
 * to the opposite of `isolate`, `guardOutDir` to `true`, and `setupFiles` replaces
 * the setup files found through the setup role.
 */
export type Options = InferInput<typeof optionsSchema>;
