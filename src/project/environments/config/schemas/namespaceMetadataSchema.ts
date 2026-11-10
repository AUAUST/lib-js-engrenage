import { optional, strictObject, string } from "valibot";

import { declareStructureNodes } from "#project/environments/config/declarers/declareStructureNodes";

const { fields } = declareStructureNodes();

export const namespaceMetadataSchema = strictObject({
  $schema: optional(string()),
  purpose: fields.namespacePurpose.schema,
  layers: fields.layers.schema,
  relation: fields.relation.schema,
});
