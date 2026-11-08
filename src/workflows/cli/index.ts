export { createProgram } from "#workflows/cli/operations/createProgram";
export { defineCommand } from "#workflows/cli/operations/defineCommand";
export { defineGroup } from "#workflows/cli/operations/defineGroup";
export { defineLazyCommand } from "#workflows/cli/operations/defineLazyCommand";
export { runProgram } from "#workflows/cli/operations/runProgram";

// @barrel utils/*.ts named
export { getOptionsEnd } from "#workflows/cli/utils/getOptionsEnd";
export { hasOption } from "#workflows/cli/utils/hasOption";
export { isOptionOf } from "#workflows/cli/utils/isOptionOf";
// @end

// @barrel types/*.ts all
export * from "#workflows/cli/types/CommandDefinition";
export * from "#workflows/cli/types/CommandParameters";
export * from "#workflows/cli/types/LazyCommand";
export * from "#workflows/cli/types/LegacyCommandDefinition";
// @end

// @barrel config/sections/*.ts named
export { debugSection } from "#workflows/cli/config/sections/debugSection";
// @end

// @barrel config/schemas/*.ts named
export { debugSchema } from "#workflows/cli/config/schemas/debugSchema";
// @end
