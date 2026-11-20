// @barrel types
export type * from "#batiment/structure/types/CardinalityViolation";
export type * from "#batiment/structure/types/DeclaredEnvironment";
export type * from "#batiment/structure/types/DeclaredStructure";
export type * from "#batiment/structure/types/EnvironmentFileNames";
export type * from "#batiment/structure/types/EnvironmentStructure";
export type * from "#batiment/structure/types/MetadataField";
export type * from "#batiment/structure/types/NamedFileRole";
export type * from "#batiment/structure/types/ResolvedStructure";
export type * from "#batiment/structure/types/StructureKind";
export type * from "#batiment/structure/types/StructureMetadata";
export type * from "#batiment/structure/types/StructureMirror";
export type * from "#batiment/structure/types/StructureNode";
export type * from "#batiment/structure/types/StructureOptions";
export type * from "#batiment/structure/types/StructureParent";
export type * from "#batiment/structure/types/StructureRelation";
export type * from "#batiment/structure/types/StructureRole";
export type * from "#batiment/structure/types/StructureSource";
export type * from "#batiment/structure/types/TestsContext";
export type * from "#batiment/structure/types/UnclassifiedReason";
// @end

export type * from "#batiment/structure/types/DeclaredEnvironment";
// @barrel ports
export type * from "#batiment/structure/ports/EnvironmentStructureOption";
// @end

// @barrel operations
export { assignRoleFiles } from "#batiment/structure/operations/assignRoleFiles";
export { createStructureDomainResolver } from "#batiment/structure/operations/createStructureDomainResolver";
export { createStructureRoleResolver } from "#batiment/structure/operations/createStructureRoleResolver";
export { createStructureWalker } from "#batiment/structure/operations/createStructureWalker";
export { listStructureDirectories } from "#batiment/structure/operations/listStructureDirectories";
export { listStructureFiles } from "#batiment/structure/operations/listStructureFiles";
export { listStructureFilesAtAnyDepth } from "#batiment/structure/operations/listStructureFilesAtAnyDepth";
export { readStructureMetadata } from "#batiment/structure/operations/readStructureMetadata";
export { resolveEnvironmentStructure } from "#batiment/structure/operations/resolveEnvironmentStructure";
export { resolveStructure } from "#batiment/structure/operations/resolveStructure";
// @end

// @barrel utils
export { collectStructureNodes } from "#batiment/structure/utils/collectStructureNodes";
export { constrainsFileRole } from "#batiment/structure/utils/constrainsFileRole";
export { createMirrorClassifier } from "#batiment/structure/utils/createMirrorClassifier";
export { extendRoleLocation } from "#batiment/structure/utils/extendRoleLocation";
export { flattenStructure } from "#batiment/structure/utils/flattenStructure";
export { getLocalRoleName } from "#batiment/structure/utils/getLocalRoleName";
export { getStructureCardinality } from "#batiment/structure/utils/getStructureCardinality";
export { getStructureLayer } from "#batiment/structure/utils/getStructureLayer";
export { groupRoleFiles } from "#batiment/structure/utils/groupRoleFiles";
export { isPlaced } from "#batiment/structure/utils/isPlaced";
export { isViolatingNode } from "#batiment/structure/utils/isViolatingNode";
export { listBlockingDiagnostics } from "#batiment/structure/utils/listBlockingDiagnostics";
export { listContestedOptionPaths } from "#batiment/structure/utils/listContestedOptionPaths";
export { listNamedFileRoles } from "#batiment/structure/utils/listNamedFileRoles";
export { listNodeViolations } from "#batiment/structure/utils/listNodeViolations";
export { listStructureDiagnostics } from "#batiment/structure/utils/listStructureDiagnostics";
export { listStructureRoles } from "#batiment/structure/utils/listStructureRoles";
export { loosenStructureNode } from "#batiment/structure/utils/loosenStructureNode";
export { matchFileRole } from "#batiment/structure/utils/matchFileRole";
export { mergeStructureMetadata } from "#batiment/structure/utils/mergeStructureMetadata";
export { renderCardinalityViolation } from "#batiment/structure/utils/renderCardinalityViolation";
export { renderCommandGroupTwin } from "#batiment/structure/utils/renderCommandGroupTwin";
export { renderStructureDiagnostic } from "#batiment/structure/utils/renderStructureDiagnostic";
export { resolveDomainEntries } from "#batiment/structure/utils/resolveDomainEntries";
// @end
