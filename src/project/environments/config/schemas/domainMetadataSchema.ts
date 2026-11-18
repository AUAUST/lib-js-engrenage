import { declareStructureNodes } from "#project/environments/config/declarers/declareStructureNodes";

export const domainMetadataSchema = declareStructureNodes().metadata.domain
  .schema;
