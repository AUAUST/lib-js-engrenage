import { optional, strictObject, string } from "valibot";

import { declareStructureNodes } from "#project/environments/config/declarers/declareStructureNodes";

const { fields } = declareStructureNodes();

export const domainMetadataSchema = strictObject({
  $schema: optional(string()),
  purpose: fields.domainPurpose.schema,
  specifier: fields.specifier.schema,
  internals: fields.internals.schema,
  reexport: fields.reexport.schema,
  public: fields.public.schema,
});
