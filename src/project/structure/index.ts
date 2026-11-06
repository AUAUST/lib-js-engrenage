export { findImportCycles } from "#project/structure/operations/findImportCycles";
export { resolveAliases } from "#project/structure/operations/resolveAliases";
export { resolveEnvironmentStructure } from "#project/structure/operations/resolveEnvironmentStructure";
export { resolveImportRules } from "#project/structure/operations/resolveImportRules";

// @barrel types/*.ts all
export * from "#project/structure/types/Alias";
export * from "#project/structure/types/AliasesInput";
export * from "#project/structure/types/AliasesOption";
export * from "#project/structure/types/DomainInput";
export * from "#project/structure/types/EffectModuleResolver";
export * from "#project/structure/types/EffectModules";
export * from "#project/structure/types/Entity";
export * from "#project/structure/types/EntityIndex";
export * from "#project/structure/types/EnvironmentRoles";
export * from "#project/structure/types/EnvironmentStructure";
export * from "#project/structure/types/ImportCategory";
export * from "#project/structure/types/ImportCycle";
export * from "#project/structure/types/ImportRelation";
export * from "#project/structure/types/ImportRule";
export * from "#project/structure/types/ImportRuleSource";
export * from "#project/structure/types/ImportRuleTarget";
export * from "#project/structure/types/NamespaceInput";
export * from "#project/structure/types/ProgramLayout";
export * from "#project/structure/types/ResolvedAliases";
export * from "#project/structure/types/ResolvedEffects";
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
export * from "#project/structure/types/StructureRelation";
export * from "#project/structure/types/StructureRole";
export * from "#project/structure/types/StructureSource";
export * from "#project/structure/types/TestsContext";
export * from "#project/structure/types/TestsLayout";
export * from "#project/structure/types/TestVariant";
export * from "#project/structure/types/UnclassifiedReason";
// @end

// @barrel config/schemas/*.ts named
export { aliasesSchema } from "#project/structure/config/schemas/aliasesSchema";
export { domainSchema } from "#project/structure/config/schemas/domainSchema";
export { effectLevelsSchema } from "#project/structure/config/schemas/effectLevelsSchema";
export { effectModulesSchema } from "#project/structure/config/schemas/effectModulesSchema";
export { effectsSchema } from "#project/structure/config/schemas/effectsSchema";
export { namespaceSchema } from "#project/structure/config/schemas/namespaceSchema";
export { structureOptions } from "#project/structure/config/schemas/structureOptions";
export { structureSchema } from "#project/structure/config/schemas/structureSchema";
// @end

// @barrel utils/*.ts named
export { completeRole } from "#project/structure/utils/completeRole";
export { createEntityIndex } from "#project/structure/utils/createEntityIndex";
export { createImportResolver } from "#project/structure/utils/createImportResolver";
export { getEntryFile } from "#project/structure/utils/getEntryFile";
export { getIndexFile } from "#project/structure/utils/getIndexFile";
export { getLocalRoleName } from "#project/structure/utils/getLocalRoleName";
export { hasStructureViolations } from "#project/structure/utils/hasStructureViolations";
export { listDiscoveredGlobs } from "#project/structure/utils/listDiscoveredGlobs";
export { normalizeNamespaces } from "#project/structure/utils/normalizeNamespaces";
export { rankModule } from "#project/structure/utils/rankModule";
export { registerRoles } from "#project/structure/utils/registerRoles";
export { renderImportCycles } from "#project/structure/utils/renderImportCycles";
export { renderStructure } from "#project/structure/utils/renderStructure";
export { resolveDomainEntries } from "#project/structure/utils/resolveDomainEntries";
export { resolveRoles } from "#project/structure/utils/resolveRoles";
// @end
