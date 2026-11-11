// @barrel setup
export { createVitestConfigStep } from "#tools/vitest/setup/createVitestConfigStep";
export { createVitestCoverageStep } from "#tools/vitest/setup/createVitestCoverageStep";
export { createVitestStep } from "#tools/vitest/setup/createVitestStep";
// @end

// @barrel config/definers
export { defineVitestConfig } from "#tools/vitest/config/defineVitestConfig";
// @end

export { createVitestConfig } from "#tools/vitest/operations/createVitestConfig";
export { createVitestLayer } from "#tools/vitest/operations/createVitestLayer";
export { resolveVitestArguments } from "#tools/vitest/operations/resolveVitestArguments";
export { resolveVitestCoverageArguments } from "#tools/vitest/operations/resolveVitestCoverageArguments";
export { resolveVitestDistArguments } from "#tools/vitest/operations/resolveVitestDistArguments";
export { resolveVitestWatchArguments } from "#tools/vitest/operations/resolveVitestWatchArguments";
export { createOutDirGuard } from "#tools/vitest/plugins/createOutDirGuard";
export { createSourceGuard } from "#tools/vitest/plugins/createSourceGuard";

// @barrel types
export type * from "#tools/vitest/types/Config";
export type * from "#tools/vitest/types/ConfigFn";
export type * from "#tools/vitest/types/Options";
// @end
