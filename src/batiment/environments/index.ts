// @barrel config/declarers
export { declareProgramLayout } from "#batiment/environments/config/declarers/declareProgramLayout";
export { declareStructureNodes } from "#batiment/environments/config/declarers/declareStructureNodes";
export { declareStructureOptions } from "#batiment/environments/config/declarers/declareStructureOptions";
// @end

// @barrel ports
export type * from "#batiment/environments/ports/EnvironmentKind";
// @end

// @barrel types
export type * from "#batiment/environments/types/DomainDeclaration";
export type * from "#batiment/environments/types/DomainInput";
export type * from "#batiment/environments/types/NamespaceDeclaration";
export type * from "#batiment/environments/types/NamespaceInput";
// @end

// @barrel config/schemas
export { domainMetadataSchema } from "#batiment/environments/config/schemas/domainMetadataSchema";
export { domainSchema } from "#batiment/environments/config/schemas/domainSchema";
export { namespaceMetadataSchema } from "#batiment/environments/config/schemas/namespaceMetadataSchema";
export { namespaceSchema } from "#batiment/environments/config/schemas/namespaceSchema";
export { structureKeySchema } from "#batiment/environments/config/schemas/structureKeySchema";
// @end
