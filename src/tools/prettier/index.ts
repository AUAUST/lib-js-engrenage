// @barrel setup/*.ts named
export { createPrettierignoreStep } from "#tools/prettier/setup/createPrettierignoreStep";
export { createPrettierStep } from "#tools/prettier/setup/createPrettierStep";
export { syncPrettierignoreFile } from "#tools/prettier/setup/syncPrettierignoreFile";
// @end

// @barrel operations/*.ts named
export { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
export { definePrettierConfig } from "#tools/prettier/operations/definePrettierConfig";
export { loadPrettier } from "#tools/prettier/operations/loadPrettier";
export { resolvePrettier } from "#tools/prettier/operations/resolvePrettier";
// @end

// @barrel config/schemas/*.ts named
export { prettierSchema } from "#tools/prettier/config/schemas/prettierSchema";
// @end

// @barrel adapters/*.ts named
export { formatWithPrettier } from "#tools/prettier/adapters/formatWithPrettier";
// @end

import { definePrettierConfig } from "#tools/prettier/operations/definePrettierConfig";

/** @debt the default export loads the project configuration as soon as the entry is imported, even by consumers that only want `definePrettierConfig`; a lazy default needs a dedicated entry */
export default definePrettierConfig();
// @barrel types/*.ts all
export * from "#tools/prettier/types/Config";
export * from "#tools/prettier/types/Options";
export * from "#tools/prettier/types/Plugin";
export * from "#tools/prettier/types/PrettierInput";
export * from "#tools/prettier/types/ResolvedPrettier";
// @end
