import { declareStructureNodes } from "#batiment/environments/config/declarers/declareStructureNodes";

export const domainMetadataSchema = declareStructureNodes().metadata.domain
  .schema;
