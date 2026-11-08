export { createStructureDomainResolver } from "#project/structure/operations/createStructureDomainResolver";
export { createStructureRoleResolver } from "#project/structure/operations/createStructureRoleResolver";
export { createStructureWalker } from "#project/structure/operations/createStructureWalker";
export { findImportCycles } from "#project/structure/operations/findImportCycles";
export { listStructureDirectories } from "#project/structure/operations/listStructureDirectories";
export { listStructureFiles } from "#project/structure/operations/listStructureFiles";
export { listStructureFilesAtAnyDepth } from "#project/structure/operations/listStructureFilesAtAnyDepth";
export { resolveAliases } from "#project/structure/operations/resolveAliases";
export { resolveEnvironmentStructure } from "#project/structure/operations/resolveEnvironmentStructure";

// @barrel types/*.ts all
export * from "#project/structure/types/Alias";
export * from "#project/structure/types/AliasesOption";
export * from "#project/structure/types/BoundaryCause";
export * from "#project/structure/types/BoundaryViolation";
export * from "#project/structure/types/CardinalityViolation";
export * from "#project/structure/types/EffectModule";
export * from "#project/structure/types/EffectModuleResolver";
export * from "#project/structure/types/EffectModules";
export * from "#project/structure/types/Entity";
export * from "#project/structure/types/EntityIndex";
export * from "#project/structure/types/EnvironmentFileNames";
export * from "#project/structure/types/EnvironmentRoles";
export * from "#project/structure/types/EnvironmentStructure";
export * from "#project/structure/types/ImportCategory";
export * from "#project/structure/types/ImportCycle";
export * from "#project/structure/types/ImportEdge";
export * from "#project/structure/types/ImportGrants";
export * from "#project/structure/types/ImportKind";
export * from "#project/structure/types/ImportRelation";
export * from "#project/structure/types/LineageMember";
export * from "#project/structure/types/LocatedEntity";
export * from "#project/structure/types/NamedFileRole";
export * from "#project/structure/types/ProgramLayout";
export * from "#project/structure/types/ResolvedAliases";
export * from "#project/structure/types/ResolvedEffects";
export * from "#project/structure/types/ResolvedFiles";
export * from "#project/structure/types/ResolvedRoleContract";
export * from "#project/structure/types/ResolvedRoles";
export * from "#project/structure/types/ResolvedSpecifier";
export * from "#project/structure/types/ResolvedStructure";
export * from "#project/structure/types/RoleDefinition";
export * from "#project/structure/types/RoleEffects";
export * from "#project/structure/types/RoleEnvironment";
export * from "#project/structure/types/RoleRegistry";
export * from "#project/structure/types/StructureEnvironmentName";
export * from "#project/structure/types/StructureInput";
export * from "#project/structure/types/StructureKind";
export * from "#project/structure/types/StructureMirror";
export * from "#project/structure/types/StructureNode";
export * from "#project/structure/types/StructureOptions";
export * from "#project/structure/types/StructureParent";
export * from "#project/structure/types/StructureRelation";
export * from "#project/structure/types/StructureRole";
export * from "#project/structure/types/StructureSource";
export * from "#project/structure/types/TestsContext";
export * from "#project/structure/types/TestVariant";
export * from "#project/structure/types/UnclassifiedReason";
// @end

// @barrel config/schemas/*.ts named
export { effectLevelsSchema } from "#project/structure/config/schemas/effectLevelsSchema";
export { effectModuleResolverSchema } from "#project/structure/config/schemas/effectModuleResolverSchema";
export { effectModuleSchema } from "#project/structure/config/schemas/effectModuleSchema";
export { effectModulesSchema } from "#project/structure/config/schemas/effectModulesSchema";
export { effectsSchema } from "#project/structure/config/schemas/effectsSchema";
export { structureSchema } from "#project/structure/config/schemas/structureSchema";
// @end

// @barrel utils/*.ts named
export { checkBoundary } from "#project/structure/utils/checkBoundary";
export { checkData } from "#project/structure/utils/checkData";
export { checkEnvironments } from "#project/structure/utils/checkEnvironments";
export { checkLayers } from "#project/structure/utils/checkLayers";
export { checkSurfaces } from "#project/structure/utils/checkSurfaces";
export { checkTests } from "#project/structure/utils/checkTests";
export { checkWorkspaces } from "#project/structure/utils/checkWorkspaces";
export { classifyEntityFile } from "#project/structure/utils/classifyEntityFile";
export { collectStructureNodes } from "#project/structure/utils/collectStructureNodes";
export { completeRole } from "#project/structure/utils/completeRole";
export { constrainsFileRole } from "#project/structure/utils/constrainsFileRole";
export { createEntityIndex } from "#project/structure/utils/createEntityIndex";
export { createImportResolver } from "#project/structure/utils/createImportResolver";
export { createMirrorClassifier } from "#project/structure/utils/createMirrorClassifier";
export { createStructureEntity } from "#project/structure/utils/createStructureEntity";
export { extendEntityLineage } from "#project/structure/utils/extendEntityLineage";
export { getAliasSpecifier } from "#project/structure/utils/getAliasSpecifier";
export { getEntryFile } from "#project/structure/utils/getEntryFile";
export { getEnvironmentRootRole } from "#project/structure/utils/getEnvironmentRootRole";
export { getExecutableFile } from "#project/structure/utils/getExecutableFile";
export { getImportCategory } from "#project/structure/utils/getImportCategory";
export { getIndexFile } from "#project/structure/utils/getIndexFile";
export { getLocalRoleName } from "#project/structure/utils/getLocalRoleName";
export { getStructureCardinality } from "#project/structure/utils/getStructureCardinality";
export { getStructureLayer } from "#project/structure/utils/getStructureLayer";
export { hasStructureViolations } from "#project/structure/utils/hasStructureViolations";
export { isStructureEnvironment } from "#project/structure/utils/isStructureEnvironment";
export { listDiscoveredGlobs } from "#project/structure/utils/listDiscoveredGlobs";
export { listDomainsWithoutPurpose } from "#project/structure/utils/listDomainsWithoutPurpose";
export { listEnvironmentRoles } from "#project/structure/utils/listEnvironmentRoles";
export { listNamedFileRoles } from "#project/structure/utils/listNamedFileRoles";
export { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
export { listStructureRoles } from "#project/structure/utils/listStructureRoles";
export { loosenStructureNode } from "#project/structure/utils/loosenStructureNode";
export { matchFileRole } from "#project/structure/utils/matchFileRole";
export { normalizeNamespaces } from "#project/structure/utils/normalizeNamespaces";
export { rankModule } from "#project/structure/utils/rankModule";
export { registerRoles } from "#project/structure/utils/registerRoles";
export { renderImportCycles } from "#project/structure/utils/renderImportCycles";
export { renderStructure } from "#project/structure/utils/renderStructure";
export { resolveDomainEntries } from "#project/structure/utils/resolveDomainEntries";
export { resolveEnvironmentGrants } from "#project/structure/utils/resolveEnvironmentGrants";
export { resolveRoles } from "#project/structure/utils/resolveRoles";
// @end

// @barrel config/sections/*.ts named
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
