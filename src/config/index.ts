export { defineConfig } from "#config/config/defineConfig";
export { loadConfig } from "#config/utils/loadConfig";
export type { Accessors } from "#support/accessors/types/Accessors";
export type { PackageJson } from "#support/packageJson/types/PackageJson";
export type { Tsconfig } from "#support/tsconfig/types/Tsconfig";

// @reference src/config/types
export * from "#config/types/Config";
export * from "#config/types/ResolvedConfig";
// @end
