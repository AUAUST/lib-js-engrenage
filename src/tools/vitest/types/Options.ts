import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/vitest/config/schemas/optionsSchema";

/**
 * Options of `defineVitestConfig`. `isolate` defaults to `true`, `restoreMocks`
 * to the opposite of `isolate`, `plugins` switches the built-in plugins by
 * name, each enabled by default, and `setupFiles` adds to the setup files found
 * through the `testsetup` role.
 */
export type Options = InferInput<typeof optionsSchema>;
