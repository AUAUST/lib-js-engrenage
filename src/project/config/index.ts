// @barrel types/*.ts types
export type * from "#project/config/types/ConfigContext";
export type * from "#project/config/types/ConfigKey";
export type * from "#project/config/types/ConfigResolver";
export type * from "#project/config/types/ConfigSections";
export type * from "#project/config/types/ConfigSlots";
export type * from "#project/config/types/Definition";
export type * from "#project/config/types/DefinitionOptions";
export type * from "#project/config/types/Environment";
export type * from "#project/config/types/Extension";
export type * from "#project/config/types/ExtensionSections";
export type * from "#project/config/types/FileLocation";
export type * from "#project/config/types/FileResource";
export type * from "#project/config/types/GlobalScope";
export type * from "#project/config/types/KeyDeclaration";
export type * from "#project/config/types/LoadedConfig";
export type * from "#project/config/types/LocatedResource";
export type * from "#project/config/types/RawConfig";
export type * from "#project/config/types/ResolvedGlobal";
export type * from "#project/config/types/ResolvedGlobals";
export type * from "#project/config/types/ResolvedResources";
export type * from "#project/config/types/ResolvedRuntimeSettings";
export type * from "#project/config/types/SectionsOf";
// @end

// @barrel operations/*.ts named
export { createProjectConfig } from "#project/config/operations/createProjectConfig";
export { loadConfig } from "#project/config/operations/loadConfig";
export { loadValidatedConfig } from "#project/config/operations/loadValidatedConfig";
export { readRawConfig } from "#project/config/operations/readRawConfig";
export { selectEntry } from "#project/config/operations/selectEntry";
export { validateConfig } from "#project/config/operations/validateConfig";
// @end

// @barrel utils/*.ts named
export { assertSerializable } from "#project/config/utils/assertSerializable";
export { checkFileParts } from "#project/config/utils/checkFileParts";
export { createResourceIgnores } from "#project/config/utils/createResourceIgnores";
export { isDefinition } from "#project/config/utils/isDefinition";
export { isValidDefinition } from "#project/config/utils/isValidDefinition";
export { listLocationGlobs } from "#project/config/utils/listLocationGlobs";
export { locateFile } from "#project/config/utils/locateFile";
export { memoizeByContext } from "#project/config/utils/memoizeByContext";
export { resolveGlobal } from "#project/config/utils/resolveGlobal";
export { serialize } from "#project/config/utils/serialize";
// @end

// @barrel config/sections/*.ts named
export { extensionsSection } from "#project/config/config/sections/extensionsSection";
export { resourcesSection } from "#project/config/config/sections/resourcesSection";
// @end

// @barrel config/schemas/*.ts named
export { extensionSchema } from "#project/config/config/schemas/extensionSchema";
export { extensionsSchema } from "#project/config/config/schemas/extensionsSchema";
// @end
