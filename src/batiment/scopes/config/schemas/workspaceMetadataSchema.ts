import { string } from "valibot";

import { debtSchema } from "#batiment/scopes/config/schemas/debtSchema";
import { schemaReferenceSchema } from "#batiment/scopes/config/schemas/schemaReferenceSchema";
import { declare, declareObject } from "#foundation/options/index";

export const workspaceMetadataSchema = declareObject({
  $schema: schemaReferenceSchema,
  purpose: declare(string(), {
    description: "One line stating what the workspace holds.",
    optional: { value: undefined },
  }),
  debt: debtSchema,
});
