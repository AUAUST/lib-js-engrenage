export { findImportCycles } from "#project/structure/operations/findImportCycles";
export { reportStructure } from "#project/structure/operations/reportStructure";
export { resolveAliases } from "#project/structure/operations/resolveAliases";

// @barrel types
export type * from "#project/structure/types/AliasesOption";
export type * from "#project/structure/types/ResolvedFiles";
export type * from "#project/structure/types/StructureInput";
// @end

// @barrel config/schemas
export { structureSchema } from "#project/structure/config/schemas/structureSchema";
// @end

// @barrel utils
export { createImportResolver } from "#project/structure/utils/createImportResolver";
// @end

// @barrel config/sections
export { aliasesSection } from "#project/structure/config/sections/aliasesSection";
export { effectModulesSection } from "#project/structure/config/sections/effectModulesSection";
export { entitiesSection } from "#project/structure/config/sections/entitiesSection";
export { environmentRolesSection } from "#project/structure/config/sections/environmentRolesSection";
export { filesSection } from "#project/structure/config/sections/filesSection";
export { importGrantsSection } from "#project/structure/config/sections/importGrantsSection";
export { importResolverSection } from "#project/structure/config/sections/importResolverSection";
export { sourceExportsSection } from "#project/structure/config/sections/sourceExportsSection";
export { structureOptionsSection } from "#project/structure/config/sections/structureOptionsSection";
export { structureSection } from "#project/structure/config/sections/structureSection";
// @end
