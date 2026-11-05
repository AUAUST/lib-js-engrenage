// @barrel types/*.ts all
export * from "#project/config/types/CacheInput";
export * from "#project/config/types/ConfigContext";
export * from "#project/config/types/DefineContext";
export * from "#project/config/types/DefineInput";
export * from "#project/config/types/Definition";
export * from "#project/config/types/DefinitionOptions";
export * from "#project/config/types/Environment";
export * from "#project/config/types/GlobalScope";
export * from "#project/config/types/GlobalsFactory";
export * from "#project/config/types/ProjectConfig";
export * from "#project/config/types/RawConfig";
export * from "#project/config/types/ResolvedCache";
export * from "#project/config/types/ResolvedDefine";
export * from "#project/config/types/ResolvedFiles";
export * from "#project/config/types/ResolvedGlobal";
export * from "#project/config/types/ResolvedGlobals";
export * from "#project/config/types/ResolvedRuntimeSettings";
// @end
export type { Filesystem } from "#foundation/filesystem/index";
export type { Runtime } from "#project/baseline/index";
export type { ResolvedBuild } from "#project/build/index";
export type {
  ResolvedBin,
  ResolvedCodeEnvironment,
  ResolvedData,
  ResolvedScripts,
  ResolvedSource,
  ResolvedTests,
  ResolvedTestsPatterns,
  ResolvedTooling,
} from "#project/environments/index";
export type {
  Preset,
  ResolvedTraitAdjustments,
  ResolvedTraits,
  Trait,
} from "#project/presets/index";
export type {
  EnvironmentTsconfig,
  ManagedEnvironmentTsconfig,
  ResolvedBaseTsconfig,
  ResolvedEnvironmentTsconfig,
  ResolvedEnvironmentTsconfigOption,
  TsconfigEnvironment,
  TsconfigGroups,
  TsconfigKey,
  TsconfigOwner,
  UnmanagedEnvironmentTsconfig,
} from "#project/tsconfig/index";

// @barrel config/schemas/*.ts named
export { cacheSchema } from "#project/config/config/schemas/cacheSchema";
export { debugSchema } from "#project/config/config/schemas/debugSchema";
export { defineSchema } from "#project/config/config/schemas/defineSchema";
export { globalsSchema } from "#project/config/config/schemas/globalsSchema";
// @end

// @barrel operations/*.ts named
export { createProjectConfig } from "#project/config/operations/createProjectConfig";
export { createProjectSections } from "#project/config/operations/createProjectSections";
export { isDebugEnvironment } from "#project/config/operations/isDebugEnvironment";
export { loadConfig } from "#project/config/operations/loadConfig";
export { readConfig } from "#project/config/operations/readConfig";
export { readRawConfig } from "#project/config/operations/readRawConfig";
// @end

// @barrel utils/*.ts named
export { assertSerializable } from "#project/config/utils/assertSerializable";
export { createContext } from "#project/config/utils/createContext";
export { createDefine } from "#project/config/utils/createDefine";
export { define } from "#project/config/utils/define";
export { isDefinition } from "#project/config/utils/isDefinition";
export { isValidDefinition } from "#project/config/utils/isValidDefinition";
export { locateFile } from "#project/config/utils/locateFile";
export { resolveGlobal } from "#project/config/utils/resolveGlobal";
export { serialize } from "#project/config/utils/serialize";
// @end
