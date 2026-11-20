import { declareStructureNodes } from "#batiment/environments/config/declarers/declareStructureNodes";

export const namespaceMetadataSchema = declareStructureNodes().metadata
  .namespace.schema;
