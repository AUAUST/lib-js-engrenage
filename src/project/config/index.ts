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
export * from "#project/config/types/LoadedConfig";
export * from "#project/config/types/RawConfig";
export * from "#project/config/types/ResolvedCache";
export * from "#project/config/types/ResolvedDefine";
export * from "#project/config/types/ResolvedFiles";
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
export { cacheSchema } from "#project/config/config/schemas/cacheSchema";
export { debugSchema } from "#project/config/config/schemas/debugSchema";
export { defineSchema } from "#project/config/config/schemas/defineSchema";
export { globalsSchema } from "#project/config/config/schemas/globalsSchema";
// @end

// @barrel operations/*.ts named
export { aliasesSection } from "#project/config/operations/aliasesSection";
export { binOptionsSection } from "#project/config/operations/binOptionsSection";
export { binSection } from "#project/config/operations/binSection";
export { buildSection } from "#project/config/operations/buildSection";
export { cacheSection } from "#project/config/operations/cacheSection";
export { createDefine } from "#project/config/operations/createDefine";
export { createProjectConfig } from "#project/config/operations/createProjectConfig";
export { dataSection } from "#project/config/operations/dataSection";
export { debugSection } from "#project/config/operations/debugSection";
export { defineSection } from "#project/config/operations/defineSection";
export { environmentSection } from "#project/config/operations/environmentSection";
export { filesSection } from "#project/config/operations/filesSection";
export { formatSection } from "#project/config/operations/formatSection";
export { importRulesSection } from "#project/config/operations/importRulesSection";
export { isDebugEnvironment } from "#project/config/operations/isDebugEnvironment";
export { loadConfig } from "#project/config/operations/loadConfig";
export { locateTsconfigPath } from "#project/config/operations/locateTsconfigPath";
export { packageJsonPathSection } from "#project/config/operations/packageJsonPathSection";
export { packageJsonSection } from "#project/config/operations/packageJsonSection";
export { presetSection } from "#project/config/operations/presetSection";
export { readConfig } from "#project/config/operations/readConfig";
export { readEnvironmentRoles } from "#project/config/operations/readEnvironmentRoles";
export { readRawConfig } from "#project/config/operations/readRawConfig";
export { resolveEnvironment } from "#project/config/operations/resolveEnvironment";
export { resolveEnvironmentRoles } from "#project/config/operations/resolveEnvironmentRoles";
export { resolveEnvironmentTsconfig } from "#project/config/operations/resolveEnvironmentTsconfig";
export { runtimeSection } from "#project/config/operations/runtimeSection";
export { scriptsOptionsSection } from "#project/config/operations/scriptsOptionsSection";
export { scriptsSection } from "#project/config/operations/scriptsSection";
export { sourceExportsSection } from "#project/config/operations/sourceExportsSection";
export { sourceOptionsSection } from "#project/config/operations/sourceOptionsSection";
export { sourceSection } from "#project/config/operations/sourceSection";
export { structureOptionsSection } from "#project/config/operations/structureOptionsSection";
export { structureSection } from "#project/config/operations/structureSection";
export { testsOptionsSection } from "#project/config/operations/testsOptionsSection";
export { testsSection } from "#project/config/operations/testsSection";
export { toolingOptionsSection } from "#project/config/operations/toolingOptionsSection";
export { toolingSection } from "#project/config/operations/toolingSection";
export { traitAdjustmentsSection } from "#project/config/operations/traitAdjustmentsSection";
export { traitsSection } from "#project/config/operations/traitsSection";
export { tsconfigSection } from "#project/config/operations/tsconfigSection";
export { typescriptOptionsSection } from "#project/config/operations/typescriptOptionsSection";
export { typescriptSection } from "#project/config/operations/typescriptSection";
export { workspacesSection } from "#project/config/operations/workspacesSection";
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
