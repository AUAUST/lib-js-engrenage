// @barrel config/declarers
export { declareCodeEnvironment } from "#project/environments/config/declarers/declareCodeEnvironment";
export { declareDefines } from "#project/environments/config/declarers/declareDefines";
export { declareProgramLayout } from "#project/environments/config/declarers/declareProgramLayout";
export { declareStructureNodes } from "#project/environments/config/declarers/declareStructureNodes";
export { declareStructureOptions } from "#project/environments/config/declarers/declareStructureOptions";
// @end

// @barrel utils
export { getOptionsKey } from "#project/environments/utils/getOptionsKey";
export { readInputDirs } from "#project/environments/utils/readInputDirs";
// @end

// @barrel ports
export type * from "#project/environments/ports/EnvironmentEntry";
export type * from "#project/environments/ports/LanguageEntry";
export type * from "#project/environments/ports/ResolvedEnvironment";
// @end

// @barrel types
export type * from "#project/environments/types/AliasesInput";
export type * from "#project/environments/types/BinInput";
export type * from "#project/environments/types/ContributedEnvironment";
export type * from "#project/environments/types/DataInput";
export type * from "#project/environments/types/DefineContext";
export type * from "#project/environments/types/DefineInput";
export type * from "#project/environments/types/DomainDeclaration";
export type * from "#project/environments/types/DomainInput";
export type * from "#project/environments/types/EnvironmentClaim";
export type * from "#project/environments/types/GlobalsFactory";
export type * from "#project/environments/types/NamespaceDeclaration";
export type * from "#project/environments/types/NamespaceInput";
export type * from "#project/environments/types/ResolvedBin";
export type * from "#project/environments/types/ResolvedCodeEnvironment";
export type * from "#project/environments/types/ResolvedData";
export type * from "#project/environments/types/ResolvedDefine";
export type * from "#project/environments/types/ResolvedScripts";
export type * from "#project/environments/types/ResolvedSource";
export type * from "#project/environments/types/ResolvedTests";
export type * from "#project/environments/types/ResolvedTestsPatterns";
export type * from "#project/environments/types/ResolvedTooling";
export type * from "#project/environments/types/RuntimeInput";
export type * from "#project/environments/types/ScriptsInput";
export type * from "#project/environments/types/SourceInput";
export type * from "#project/environments/types/TestsInput";
export type * from "#project/environments/types/ToolingInput";
// @end

// @barrel config/schemas
export { aliasesSchema } from "#project/environments/config/schemas/aliasesSchema";
export { binSchema } from "#project/environments/config/schemas/binSchema";
export { dataSchema } from "#project/environments/config/schemas/dataSchema";
export { defineSchema } from "#project/environments/config/schemas/defineSchema";
export { domainMetadataSchema } from "#project/environments/config/schemas/domainMetadataSchema";
export { domainSchema } from "#project/environments/config/schemas/domainSchema";
export { globalsSchema } from "#project/environments/config/schemas/globalsSchema";
export { namespaceMetadataSchema } from "#project/environments/config/schemas/namespaceMetadataSchema";
export { namespaceSchema } from "#project/environments/config/schemas/namespaceSchema";
export { runtimeSchema } from "#project/environments/config/schemas/runtimeSchema";
export { scriptsSchema } from "#project/environments/config/schemas/scriptsSchema";
export { sourceSchema } from "#project/environments/config/schemas/sourceSchema";
export { structureKeySchema } from "#project/environments/config/schemas/structureKeySchema";
export { testsSchema } from "#project/environments/config/schemas/testsSchema";
export { toolingSchema } from "#project/environments/config/schemas/toolingSchema";
// @end

// @barrel operations
export { createDefine } from "#project/environments/operations/createDefine";
export { readEnvironment } from "#project/environments/operations/readEnvironment";
export { readEnvironments } from "#project/environments/operations/readEnvironments";
export { resolveCodeEnvironment } from "#project/environments/operations/resolveCodeEnvironment";
export { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
export { resolveEnvironmentDirs } from "#project/environments/operations/resolveEnvironmentDirs";
export { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
// @end

// @barrel config/sections
export { binOptionsSection } from "#project/environments/config/sections/binOptionsSection";
export { binSection } from "#project/environments/config/sections/binSection";
export { dataSection } from "#project/environments/config/sections/dataSection";
export { defineSection } from "#project/environments/config/sections/defineSection";
export { environmentClaimsSection } from "#project/environments/config/sections/environmentClaimsSection";
export { environmentsSection } from "#project/environments/config/sections/environmentsSection";
export { runtimeSection } from "#project/environments/config/sections/runtimeSection";
export { scriptsOptionsSection } from "#project/environments/config/sections/scriptsOptionsSection";
export { scriptsSection } from "#project/environments/config/sections/scriptsSection";
export { sourceOptionsSection } from "#project/environments/config/sections/sourceOptionsSection";
export { sourceSection } from "#project/environments/config/sections/sourceSection";
export { testsOptionsSection } from "#project/environments/config/sections/testsOptionsSection";
export { testsSection } from "#project/environments/config/sections/testsSection";
export { toolingOptionsSection } from "#project/environments/config/sections/toolingOptionsSection";
export { toolingSection } from "#project/environments/config/sections/toolingSection";
// @end
