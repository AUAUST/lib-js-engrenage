export { define } from "#config/config/define";
export { defineConfig } from "#config/config/defineConfig";
export { loadConfig } from "#config/utils/loadConfig";
export type { PackageJson } from "#support/packageJson/types/PackageJson";
export type { ConfigInput } from "#types/ConfigInput";

// @barrel types/*.ts all
export * from "#config/types/Accessors";
export * from "#config/types/Config";
export * from "#config/types/DefineContext";
export * from "#config/types/Definition";
export * from "#config/types/DefinitionOptions";
export * from "#config/types/Environment";
export * from "#config/types/EnvironmentTsconfig";
export * from "#config/types/Filesystem";
export * from "#config/types/GlobalScope";
export * from "#config/types/GlobalsFactory";
export * from "#config/types/ListAdjustment";
export * from "#config/types/ListOption";
export * from "#config/types/ManagedListOption";
export * from "#config/types/Preset";
export * from "#config/types/Presets";
export * from "#config/types/ResolvedConfig";
export * from "#config/types/ResolvedGlobal";
export * from "#config/types/ResolvedGlobals";
export * from "#config/types/TsconfigGroups";
export * from "#config/types/TsconfigKey";
// @end
