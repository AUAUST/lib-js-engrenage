import { declareStructureNodes } from "#project/environments/config/declarers/declareStructureNodes";

export const namespaceMetadataSchema = declareStructureNodes().metadata
  .namespace.schema;
