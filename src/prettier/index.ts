// @reference config/prettier
export * from "#config/prettier/prettierOptions";
// @end

export { prettierOptions as default } from "#config/prettier/prettierOptions";
export { createPrettierConfig } from "#prettier/builders/createPrettierConfig";
export type { Config } from "#prettier/types/Config";
export type { Plugin } from "#prettier/types/Plugin";
