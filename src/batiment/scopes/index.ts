// @barrel config/declarers
export { declareLayout } from "#batiment/scopes/config/declarers/declareLayout";
export { declareNamespaceKind } from "#batiment/scopes/config/declarers/declareNamespaceKind";
export { declareStructureNodes } from "#batiment/scopes/config/declarers/declareStructureNodes";
export { declareStructureOptions } from "#batiment/scopes/config/declarers/declareStructureOptions";
// @end

// @barrel ports
export type * from "#batiment/scopes/ports/EnvironmentClaim";
export type * from "#batiment/scopes/ports/NamespaceKind";
// @end

// @barrel types
export type * from "#batiment/scopes/types/DiscoveredNamespace";
export type * from "#batiment/scopes/types/DiscoveredWorkspace";
export type * from "#batiment/scopes/types/DomainDeclaration";
export type * from "#batiment/scopes/types/DomainInput";
export type * from "#batiment/scopes/types/InwardPolicy";
export type * from "#batiment/scopes/types/LayoutContext";
export type * from "#batiment/scopes/types/NamespaceDeclaration";
export type * from "#batiment/scopes/types/NamespaceImports";
export type * from "#batiment/scopes/types/NamespaceInput";
export type * from "#batiment/scopes/types/NamespaceInstance";
export type * from "#batiment/scopes/types/NamespaceKindPreset";
export type * from "#batiment/scopes/types/NamespaceRelation";
export type * from "#batiment/scopes/types/Scope";
export type * from "#batiment/scopes/types/ScopeTree";
export type * from "#batiment/scopes/types/TestVariant";
// @end

// @barrel config/schemas
export { domainMetadataSchema } from "#batiment/scopes/config/schemas/domainMetadataSchema";
export { domainSchema } from "#batiment/scopes/config/schemas/domainSchema";
export { namespaceMetadataSchema } from "#batiment/scopes/config/schemas/namespaceMetadataSchema";
export { namespaceSchema } from "#batiment/scopes/config/schemas/namespaceSchema";
export { schemaReferenceSchema } from "#batiment/scopes/config/schemas/schemaReferenceSchema";
export { structureKeySchema } from "#batiment/scopes/config/schemas/structureKeySchema";
export { workspaceMetadataSchema } from "#batiment/scopes/config/schemas/workspaceMetadataSchema";
// @end

// @barrel utils
export { createNamespaceKindPreset } from "#batiment/scopes/utils/createNamespaceKindPreset";
export { createScopeTree } from "#batiment/scopes/utils/createScopeTree";
export { findMetafileField } from "#batiment/scopes/utils/findMetafileField";
export { getNamespaceId } from "#batiment/scopes/utils/getNamespaceId";
export { listNamespaces } from "#batiment/scopes/utils/listNamespaces";
export { reconcileEnvironmentDirs } from "#batiment/scopes/utils/reconcileEnvironmentDirs";
export { resolveNamespaceKind } from "#batiment/scopes/utils/resolveNamespaceKind";
// @end
