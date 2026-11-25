// @barrel config/declarers
export { declareCodeEnvironment } from "#project/environments/config/declarers/declareCodeEnvironment";
// @end

// @barrel utils
export { composeTestsPatterns } from "#project/environments/utils/composeTestsPatterns";
export { composeVariantPatterns } from "#project/environments/utils/composeVariantPatterns";
export { getOptionsKey } from "#project/environments/utils/getOptionsKey";
export { listLanguageFiles } from "#project/environments/utils/listLanguageFiles";
export { readInputDirs } from "#project/environments/utils/readInputDirs";
// @end

// @barrel ports
export type * from "#project/environments/ports/EnvironmentEntry";
export type * from "#project/environments/ports/EnvironmentPresetEntry";
export type * from "#project/environments/ports/LanguageConfigurer";
export type * from "#project/environments/ports/LanguageEntry";
export type * from "#project/environments/ports/NamespaceKindEntry";
export type * from "#project/environments/ports/ResolvedEnvironment";
// @end

// @barrel types
export type * from "#project/environments/types/AliasesInput";
export type * from "#project/environments/types/BinInput";
export type * from "#project/environments/types/ContributedEnvironment";
export type * from "#project/environments/types/ContributedEnvironmentEntry";
export type * from "#project/environments/types/DataInput";
export type * from "#project/environments/types/DefineContext";
export type * from "#project/environments/types/DefineInput";
export type * from "#project/environments/types/EnvironmentLanguage";
export type * from "#project/environments/types/Execution";
export type * from "#project/environments/types/ExecutionGlobals";
export type * from "#project/environments/types/GlobalsFactory";
export type * from "#project/environments/types/LanguageFileMatcher";
export type * from "#project/environments/types/ModuleFormat";
export type * from "#project/environments/types/ResolvedBin";
export type * from "#project/environments/types/ResolvedCodeEnvironment";
export type * from "#project/environments/types/ResolvedData";
export type * from "#project/environments/types/ResolvedDefine";
export type * from "#project/environments/types/ResolvedExecution";
export type * from "#project/environments/types/ResolvedScripts";
export type * from "#project/environments/types/ResolvedSource";
export type * from "#project/environments/types/ResolvedStatic";
export type * from "#project/environments/types/ResolvedTests";
export type * from "#project/environments/types/ResolvedTestsPatterns";
export type * from "#project/environments/types/ResolvedTooling";
export type * from "#project/environments/types/RuntimeInput";
export type * from "#project/environments/types/ScriptsInput";
export type * from "#project/environments/types/SourceInput";
export type * from "#project/environments/types/StaticInput";
export type * from "#project/environments/types/TestsInput";
export type * from "#project/environments/types/ToolingInput";
// @end

// @barrel config/schemas
export { aliasesSchema } from "#project/environments/config/schemas/aliasesSchema";
export { binSchema } from "#project/environments/config/schemas/binSchema";
export { dataSchema } from "#project/environments/config/schemas/dataSchema";
export { defineSchema } from "#project/environments/config/schemas/defineSchema";
export { environmentsSchema } from "#project/environments/config/schemas/environmentsSchema";
export { environmentTsconfigSchema } from "#project/environments/config/schemas/environmentTsconfigSchema";
export { executionSchema } from "#project/environments/config/schemas/executionSchema";
export { globalsSchema } from "#project/environments/config/schemas/globalsSchema";
export { namespaceKindsSchema } from "#project/environments/config/schemas/namespaceKindsSchema";
export { runtimeSchema } from "#project/environments/config/schemas/runtimeSchema";
export { scriptsSchema } from "#project/environments/config/schemas/scriptsSchema";
export { sourceSchema } from "#project/environments/config/schemas/sourceSchema";
export { staticSchema } from "#project/environments/config/schemas/staticSchema";
export { testsSchema } from "#project/environments/config/schemas/testsSchema";
export { toolingSchema } from "#project/environments/config/schemas/toolingSchema";
// @end

// @barrel operations
export { createDefine } from "#project/environments/operations/createDefine";
export { createEnvironmentTsconfig } from "#project/environments/operations/createEnvironmentTsconfig";
export { createLanguageFileMatcher } from "#project/environments/operations/createLanguageFileMatcher";
export { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
export { listEnvironmentEntries } from "#project/environments/operations/listEnvironmentEntries";
export { listNamespaceEnvironments } from "#project/environments/operations/listNamespaceEnvironments";
export { listPlacementGlobs } from "#project/environments/operations/listPlacementGlobs";
export { listTsconfigRegistrations } from "#project/environments/operations/listTsconfigRegistrations";
export { readEnvironment } from "#project/environments/operations/readEnvironment";
export { readEnvironmentLanguages } from "#project/environments/operations/readEnvironmentLanguages";
export { readEnvironmentOptions } from "#project/environments/operations/readEnvironmentOptions";
export { readEnvironments } from "#project/environments/operations/readEnvironments";
export { readLayoutContext } from "#project/environments/operations/readLayoutContext";
export { readScopeNamespaces } from "#project/environments/operations/readScopeNamespaces";
export { readSelectedLanguage } from "#project/environments/operations/readSelectedLanguage";
export { readSelectedLanguages } from "#project/environments/operations/readSelectedLanguages";
export { readTestsExtension } from "#project/environments/operations/readTestsExtension";
export { resolveEntriesRuntime } from "#project/environments/operations/resolveEntriesRuntime";
export { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
export { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
export { selectLanguages } from "#project/environments/operations/selectLanguages";
// @end

// @barrel config/sections
export { binOptionsSection } from "#project/environments/config/sections/binOptionsSection";
export { binSection } from "#project/environments/config/sections/binSection";
export { dataOptionsSection } from "#project/environments/config/sections/dataOptionsSection";
export { dataSection } from "#project/environments/config/sections/dataSection";
export { defineSection } from "#project/environments/config/sections/defineSection";
export { environmentClaimsSection } from "#project/environments/config/sections/environmentClaimsSection";
export { environmentPresetsSection } from "#project/environments/config/sections/environmentPresetsSection";
export { environmentsSection } from "#project/environments/config/sections/environmentsSection";
export { environmentTsconfigsSection } from "#project/environments/config/sections/environmentTsconfigsSection";
export { executionSection } from "#project/environments/config/sections/executionSection";
export { namespaceKindOverridesSection } from "#project/environments/config/sections/namespaceKindOverridesSection";
export { namespaceKindsSection } from "#project/environments/config/sections/namespaceKindsSection";
export { runtimeSection } from "#project/environments/config/sections/runtimeSection";
export { scriptsOptionsSection } from "#project/environments/config/sections/scriptsOptionsSection";
export { scriptsSection } from "#project/environments/config/sections/scriptsSection";
export { sourceOptionsSection } from "#project/environments/config/sections/sourceOptionsSection";
export { sourceSection } from "#project/environments/config/sections/sourceSection";
export { staticOptionsSection } from "#project/environments/config/sections/staticOptionsSection";
export { staticSection } from "#project/environments/config/sections/staticSection";
export { testsOptionsSection } from "#project/environments/config/sections/testsOptionsSection";
export { testsSection } from "#project/environments/config/sections/testsSection";
export { toolingOptionsSection } from "#project/environments/config/sections/toolingOptionsSection";
export { toolingSection } from "#project/environments/config/sections/toolingSection";
// @end
