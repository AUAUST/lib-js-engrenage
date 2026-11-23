import { declareStructureNodes } from "#batiment/scopes/config/declarers/declareStructureNodes";

export const namespaceMetadataSchema = declareStructureNodes().metadata
  .namespace.schema;
