import { declareStructureNodes } from "#batiment/environments/config/declarers/declareStructureNodes";

export const environmentMetadataSchema = declareStructureNodes().metadata
  .environment.schema;
