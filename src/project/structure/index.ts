export { createStructureDomainResolver } from "#project/structure/operations/createStructureDomainResolver";
export { createStructureRoleResolver } from "#project/structure/operations/createStructureRoleResolver";
export { createStructureWalker } from "#project/structure/operations/createStructureWalker";
export { findImportCycles } from "#project/structure/operations/findImportCycles";
export { listStructureDirectories } from "#project/structure/operations/listStructureDirectories";
export { listStructureFiles } from "#project/structure/operations/listStructureFiles";
export { listStructureFilesAtAnyDepth } from "#project/structure/operations/listStructureFilesAtAnyDepth";
export { reportStructure } from "#project/structure/operations/reportStructure";
export { resolveAliases } from "#project/structure/operations/resolveAliases";
export { resolveEnvironmentStructure } from "#project/structure/operations/resolveEnvironmentStructure";

// @barrel apis
export type * from "#project/structure/apis/EntityIndex";
// @end

// @barrel types
export type * from "#project/structure/types/Alias";
export type * from "#project/structure/types/AliasesOption";
export type * from "#project/structure/types/BoundaryCause";
export type * from "#project/structure/types/BoundaryViolation";
export type * from "#project/structure/types/CardinalityViolation";
export type * from "#project/structure/types/DeclaredStructure";
export type * from "#project/structure/types/Entity";
export type * from "#project/structure/types/EnvironmentFileNames";
export type * from "#project/structure/types/EnvironmentStructure";
export type * from "#project/structure/types/ImportCategory";
export type * from "#project/structure/types/ImportCycle";
export type * from "#project/structure/types/ImportEdge";
export type * from "#project/structure/types/ImportGrants";
export type * from "#project/structure/types/ImportKind";
export type * from "#project/structure/types/ImportRelation";
export type * from "#project/structure/types/LineageMember";
export type * from "#project/structure/types/LocatedEntity";
export type * from "#project/structure/types/MetadataField";
export type * from "#project/structure/types/NamedFileRole";
export type * from "#project/structure/types/OptionSource";
export type * from "#project/structure/types/ResolvedAliases";
export type * from "#project/structure/types/ResolvedFiles";
export type * from "#project/structure/types/ResolvedSpecifier";
export type * from "#project/structure/types/ResolvedStructure";
export type * from "#project/structure/types/StructureDiagnostic";
export type * from "#project/structure/types/StructureDiagnosticCode";
export type * from "#project/structure/types/StructureInput";
export type * from "#project/structure/types/StructureKind";
export type * from "#project/structure/types/StructureMetadata";
export type * from "#project/structure/types/StructureMirror";
export type * from "#project/structure/types/StructureNode";
export type * from "#project/structure/types/StructureOptions";
export type * from "#project/structure/types/StructureParent";
export type * from "#project/structure/types/StructureRelation";
export type * from "#project/structure/types/StructureReport";
export type * from "#project/structure/types/StructureRole";
export type * from "#project/structure/types/StructureSource";
export type * from "#project/structure/types/TestsContext";
export type * from "#project/structure/types/TestVariant";
export type * from "#project/structure/types/UnclassifiedReason";
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
export { collectStructureNodes } from "#project/structure/utils/collectStructureNodes";
export { constrainsFileRole } from "#project/structure/utils/constrainsFileRole";
export { createEntityIndex } from "#project/structure/utils/createEntityIndex";
export { createImportResolver } from "#project/structure/utils/createImportResolver";
export { createMirrorClassifier } from "#project/structure/utils/createMirrorClassifier";
export { createStructureEntity } from "#project/structure/utils/createStructureEntity";
export { extendEntityLineage } from "#project/structure/utils/extendEntityLineage";
export { extendRoleLocation } from "#project/structure/utils/extendRoleLocation";
export { findStructureAliases } from "#project/structure/utils/findStructureAliases";
export { flattenStructure } from "#project/structure/utils/flattenStructure";
export { getAliasSpecifier } from "#project/structure/utils/getAliasSpecifier";
export { getEnvironmentRootRole } from "#project/structure/utils/getEnvironmentRootRole";
export { getImportCategory } from "#project/structure/utils/getImportCategory";
export { getLocalRoleName } from "#project/structure/utils/getLocalRoleName";
export { getStructureCardinality } from "#project/structure/utils/getStructureCardinality";
export { getStructureLayer } from "#project/structure/utils/getStructureLayer";
export { groupRoleFiles } from "#project/structure/utils/groupRoleFiles";
export { isEntryReference } from "#project/structure/utils/isEntryReference";
export { isPlaced } from "#project/structure/utils/isPlaced";
export { isViolatingNode } from "#project/structure/utils/isViolatingNode";
export { listBlockingDiagnostics } from "#project/structure/utils/listBlockingDiagnostics";
export { listContestedOptionPaths } from "#project/structure/utils/listContestedOptionPaths";
export { listNamedFileRoles } from "#project/structure/utils/listNamedFileRoles";
export { listNodeViolations } from "#project/structure/utils/listNodeViolations";
export { listStructureDiagnostics } from "#project/structure/utils/listStructureDiagnostics";
export { listStructureRoles } from "#project/structure/utils/listStructureRoles";
export { loosenStructureNode } from "#project/structure/utils/loosenStructureNode";
export { matchFileRole } from "#project/structure/utils/matchFileRole";
export { mergeStructureMetadata } from "#project/structure/utils/mergeStructureMetadata";
export { renderCardinalityViolation } from "#project/structure/utils/renderCardinalityViolation";
export { renderCommandGroupTwin } from "#project/structure/utils/renderCommandGroupTwin";
export { renderEnvironmentMap } from "#project/structure/utils/renderEnvironmentMap";
export { renderImportCycle } from "#project/structure/utils/renderImportCycle";
export { renderImportCycles } from "#project/structure/utils/renderImportCycles";
export { renderProjectMap } from "#project/structure/utils/renderProjectMap";
export { renderProjectMapRoles } from "#project/structure/utils/renderProjectMapRoles";
export { renderStructure } from "#project/structure/utils/renderStructure";
export { renderStructureDiagnostic } from "#project/structure/utils/renderStructureDiagnostic";
export { renderStructureLabel } from "#project/structure/utils/renderStructureLabel";
export { renderStructureTree } from "#project/structure/utils/renderStructureTree";
export { resolveDomainEntries } from "#project/structure/utils/resolveDomainEntries";
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
