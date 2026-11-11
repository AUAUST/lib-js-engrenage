import { optional, strictObject, string } from "valibot";

import { declareStructureNodes } from "#project/environments/config/declarers/declareStructureNodes";

const { fields } = declareStructureNodes();

// @debt `.namespace.json` lacks the `children` option the config accepts, so a namespace classifying its children as domains is declared only in the config
export const namespaceMetadataSchema = strictObject({
  $schema: optional(string()),
  purpose: fields.namespacePurpose.schema,
  layers: fields.layers.schema,
  relation: fields.relation.schema,
});
