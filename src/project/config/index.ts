// @barrel types/*.ts all
export * from "#project/config/types/ConfigContext";
export * from "#project/config/types/DefineContext";
export * from "#project/config/types/Definition";
export * from "#project/config/types/DefinitionOptions";
export * from "#project/config/types/Environment";
export * from "#project/config/types/GlobalScope";
export * from "#project/config/types/GlobalsFactory";
export * from "#project/config/types/LoadedConfig";
export * from "#project/config/types/RawConfig";
export * from "#project/config/types/ResolvedGlobal";
export * from "#project/config/types/ResolvedGlobals";
export * from "#project/config/types/ResolvedRuntimeSettings";
// @end

// @debt hand-written re-exports of peer and lower-layer types make `project/config` a second surface of six domains; consumers should import each type from its owner
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
export { debugSchema } from "#project/config/config/schemas/debugSchema";
// @end

// @barrel operations/*.ts named
export { createProjectConfig } from "#project/config/operations/createProjectConfig";
export { debugSection } from "#project/config/operations/debugSection";
export { isDebugEnvironment } from "#project/config/operations/isDebugEnvironment";
export { loadConfig } from "#project/config/operations/loadConfig";
export { readConfig } from "#project/config/operations/readConfig";
export { readRawConfig } from "#project/config/operations/readRawConfig";
// @end

// @barrel utils/*.ts named
export { assertSerializable } from "#project/config/utils/assertSerializable";
export { define } from "#project/config/utils/define";
export { isDefinition } from "#project/config/utils/isDefinition";
export { isValidDefinition } from "#project/config/utils/isValidDefinition";
export { locateFile } from "#project/config/utils/locateFile";
export { memoizeByContext } from "#project/config/utils/memoizeByContext";
export { resolveGlobal } from "#project/config/utils/resolveGlobal";
export { serialize } from "#project/config/utils/serialize";
// @end
