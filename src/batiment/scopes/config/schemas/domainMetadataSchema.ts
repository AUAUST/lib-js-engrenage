import { declareStructureNodes } from "#batiment/scopes/config/declarers/declareStructureNodes";

export const domainMetadataSchema = declareStructureNodes().metadata.domain
  .schema;
