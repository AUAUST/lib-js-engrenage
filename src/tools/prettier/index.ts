import { definePrettierConfig } from "#tools/prettier/operations/definePrettierConfig";

export { formatWithPrettier } from "#tools/prettier/adapters/formatWithPrettier";
export { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
export { definePrettierConfig } from "#tools/prettier/operations/definePrettierConfig";
export { syncPrettierignoreFile } from "#tools/prettier/setup/syncPrettierignoreFile";

/** @debt the default export loads the project configuration as soon as the entry is imported, even by consumers that only want `definePrettierConfig`; a lazy default needs a dedicated entry */
export default definePrettierConfig();
// @barrel types/*.ts all
export * from "#tools/prettier/types/Config";
export * from "#tools/prettier/types/Options";
export * from "#tools/prettier/types/Plugin";
export * from "#tools/prettier/types/PrettierInput";
export * from "#tools/prettier/types/ResolvedPrettier";
// @end
