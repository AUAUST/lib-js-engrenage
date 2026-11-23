// @barrel apis
export type * from "#batiment/structure/apis/EntityIndex";
// @end

// @barrel types
export type * from "#batiment/structure/types/Alias";
export type * from "#batiment/structure/types/BoundaryCause";
export type * from "#batiment/structure/types/BoundaryViolation";
export type * from "#batiment/structure/types/CardinalityViolation";
export type * from "#batiment/structure/types/DeclaredNamespace";
export type * from "#batiment/structure/types/DeclaredStructure";
export type * from "#batiment/structure/types/Entity";
export type * from "#batiment/structure/types/ImportCategory";
export type * from "#batiment/structure/types/ImportCycle";
export type * from "#batiment/structure/types/ImportEdge";
export type * from "#batiment/structure/types/ImportGrants";
export type * from "#batiment/structure/types/ImportKind";
export type * from "#batiment/structure/types/ImportRelation";
export type * from "#batiment/structure/types/LineageMember";
export type * from "#batiment/structure/types/LocatedEntity";
export type * from "#batiment/structure/types/MetadataField";
export type * from "#batiment/structure/types/NamedFileRole";
export type * from "#batiment/structure/types/NamespaceFileNames";
export type * from "#batiment/structure/types/NamespaceStructure";
export type * from "#batiment/structure/types/ResolvedAliases";
export type * from "#batiment/structure/types/ResolvedSpecifier";
export type * from "#batiment/structure/types/ResolvedStructure";
export type * from "#batiment/structure/types/StructureKind";
export type * from "#batiment/structure/types/StructureMetadata";
export type * from "#batiment/structure/types/StructureMirror";
export type * from "#batiment/structure/types/StructureNode";
export type * from "#batiment/structure/types/StructureOptions";
export type * from "#batiment/structure/types/StructureParent";
export type * from "#batiment/structure/types/StructureRelation";
export type * from "#batiment/structure/types/StructureReport";
export type * from "#batiment/structure/types/StructureRole";
export type * from "#batiment/structure/types/StructureSource";
export type * from "#batiment/structure/types/TestsContext";
export type * from "#batiment/structure/types/UnclassifiedReason";
// @end

// @barrel ports
export type * from "#batiment/structure/ports/DerivedLayout";
export type * from "#batiment/structure/ports/Layout";
export type * from "#batiment/structure/ports/NamespaceStructureOption";
export type * from "#batiment/structure/ports/RecursiveLayout";
export type * from "#batiment/structure/ports/StaticLayout";
// @end

// @barrel utils
export { checkBoundary } from "#batiment/structure/utils/checkBoundary";
export { checkLayers } from "#batiment/structure/utils/checkLayers";
export { checkNamespaces } from "#batiment/structure/utils/checkNamespaces";
export { checkSurfaces } from "#batiment/structure/utils/checkSurfaces";
export { checkTests } from "#batiment/structure/utils/checkTests";
export { checkWorkspaces } from "#batiment/structure/utils/checkWorkspaces";
export { classifyEntityFile } from "#batiment/structure/utils/classifyEntityFile";
export { collectStructureNodes } from "#batiment/structure/utils/collectStructureNodes";
export { constrainsFileRole } from "#batiment/structure/utils/constrainsFileRole";
export { createEntityIndex } from "#batiment/structure/utils/createEntityIndex";
export { createMirrorClassifier } from "#batiment/structure/utils/createMirrorClassifier";
export { createStructureEntity } from "#batiment/structure/utils/createStructureEntity";
export { extendEntityLineage } from "#batiment/structure/utils/extendEntityLineage";
export { extendRoleLocation } from "#batiment/structure/utils/extendRoleLocation";
export { findStructureAliases } from "#batiment/structure/utils/findStructureAliases";
export { flattenStructure } from "#batiment/structure/utils/flattenStructure";
export { getAliasSpecifier } from "#batiment/structure/utils/getAliasSpecifier";
export { getImportCategory } from "#batiment/structure/utils/getImportCategory";
export { getLocalRoleName } from "#batiment/structure/utils/getLocalRoleName";
export { getNamespaceCategory } from "#batiment/structure/utils/getNamespaceCategory";
export { getNamespaceRootRole } from "#batiment/structure/utils/getNamespaceRootRole";
export { getStructureCardinality } from "#batiment/structure/utils/getStructureCardinality";
export { getStructureLayer } from "#batiment/structure/utils/getStructureLayer";
export { groupRoleFiles } from "#batiment/structure/utils/groupRoleFiles";
export { isEntryReference } from "#batiment/structure/utils/isEntryReference";
export { isPlaced } from "#batiment/structure/utils/isPlaced";
export { isViolatingNode } from "#batiment/structure/utils/isViolatingNode";
export { listBlockingDiagnostics } from "#batiment/structure/utils/listBlockingDiagnostics";
export { listDeclaredOptionPaths } from "#batiment/structure/utils/listDeclaredOptionPaths";
export { listKindConflictPaths } from "#batiment/structure/utils/listKindConflictPaths";
export { listNamedFileRoles } from "#batiment/structure/utils/listNamedFileRoles";
export { listNodeViolations } from "#batiment/structure/utils/listNodeViolations";
export { listStructureDiagnostics } from "#batiment/structure/utils/listStructureDiagnostics";
export { listStructureRoles } from "#batiment/structure/utils/listStructureRoles";
export { loosenStructureNode } from "#batiment/structure/utils/loosenStructureNode";
export { matchFileRole } from "#batiment/structure/utils/matchFileRole";
export { mergeStructureMetadata } from "#batiment/structure/utils/mergeStructureMetadata";
export { renderCardinalityViolation } from "#batiment/structure/utils/renderCardinalityViolation";
export { renderCommandGroupTwin } from "#batiment/structure/utils/renderCommandGroupTwin";
export { renderImportCycle } from "#batiment/structure/utils/renderImportCycle";
export { renderImportCycles } from "#batiment/structure/utils/renderImportCycles";
export { renderNamespaceMap } from "#batiment/structure/utils/renderNamespaceMap";
export { renderProjectMap } from "#batiment/structure/utils/renderProjectMap";
export { renderProjectMapRoles } from "#batiment/structure/utils/renderProjectMapRoles";
export { renderStructure } from "#batiment/structure/utils/renderStructure";
export { renderStructureDiagnostic } from "#batiment/structure/utils/renderStructureDiagnostic";
export { renderStructureLabel } from "#batiment/structure/utils/renderStructureLabel";
export { renderStructureTree } from "#batiment/structure/utils/renderStructureTree";
export { resolveDomainEntries } from "#batiment/structure/utils/resolveDomainEntries";
export { resolveNamespaceGrants } from "#batiment/structure/utils/resolveNamespaceGrants";
// @end
