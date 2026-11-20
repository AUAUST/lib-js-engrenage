export { findImportCycles } from "#project/structure/operations/findImportCycles";
export { reportStructure } from "#project/structure/operations/reportStructure";
export { resolveAliases } from "#project/structure/operations/resolveAliases";

// @barrel apis
export type * from "#project/structure/apis/EntityIndex";
// @end

// @barrel types
export type * from "#project/structure/types/Alias";
export type * from "#project/structure/types/AliasesOption";
export type * from "#project/structure/types/BoundaryCause";
export type * from "#project/structure/types/BoundaryViolation";
export type * from "#project/structure/types/Entity";
export type * from "#project/structure/types/ImportCategory";
export type * from "#project/structure/types/ImportCycle";
export type * from "#project/structure/types/ImportEdge";
export type * from "#project/structure/types/ImportGrants";
export type * from "#project/structure/types/ImportKind";
export type * from "#project/structure/types/ImportRelation";
export type * from "#project/structure/types/LineageMember";
export type * from "#project/structure/types/LocatedEntity";
export type * from "#project/structure/types/ResolvedAliases";
export type * from "#project/structure/types/ResolvedFiles";
export type * from "#project/structure/types/ResolvedSpecifier";
export type * from "#project/structure/types/StructureInput";
export type * from "#project/structure/types/StructureReport";
export type * from "#project/structure/types/TestVariant";
// @end

// @barrel config/schemas
export { structureSchema } from "#project/structure/config/schemas/structureSchema";
// @end

// @barrel utils
export { checkBoundary } from "#project/structure/utils/checkBoundary";
export { checkData } from "#project/structure/utils/checkData";
export { checkEnvironments } from "#project/structure/utils/checkEnvironments";
export { checkLayers } from "#project/structure/utils/checkLayers";
export { checkSurfaces } from "#project/structure/utils/checkSurfaces";
export { checkTests } from "#project/structure/utils/checkTests";
export { checkWorkspaces } from "#project/structure/utils/checkWorkspaces";
export { classifyEntityFile } from "#project/structure/utils/classifyEntityFile";
export { createEntityIndex } from "#project/structure/utils/createEntityIndex";
export { createImportResolver } from "#project/structure/utils/createImportResolver";
export { createStructureEntity } from "#project/structure/utils/createStructureEntity";
export { extendEntityLineage } from "#project/structure/utils/extendEntityLineage";
export { findStructureAliases } from "#project/structure/utils/findStructureAliases";
export { getAliasSpecifier } from "#project/structure/utils/getAliasSpecifier";
export { getEnvironmentRootRole } from "#project/structure/utils/getEnvironmentRootRole";
export { getImportCategory } from "#project/structure/utils/getImportCategory";
export { isEntryReference } from "#project/structure/utils/isEntryReference";
export { renderEnvironmentMap } from "#project/structure/utils/renderEnvironmentMap";
export { renderImportCycle } from "#project/structure/utils/renderImportCycle";
export { renderImportCycles } from "#project/structure/utils/renderImportCycles";
export { renderProjectMap } from "#project/structure/utils/renderProjectMap";
export { renderProjectMapRoles } from "#project/structure/utils/renderProjectMapRoles";
export { renderStructure } from "#project/structure/utils/renderStructure";
export { renderStructureLabel } from "#project/structure/utils/renderStructureLabel";
export { renderStructureTree } from "#project/structure/utils/renderStructureTree";
export { resolveEnvironmentGrants } from "#project/structure/utils/resolveEnvironmentGrants";
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
