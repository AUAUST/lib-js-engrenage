import { string } from "valibot";

import { schemaReferenceSchema } from "#batiment/environments/index";
import { declare, declareObject } from "#foundation/options/index";

export const workspaceMetadataSchema = declareObject({
  $schema: schemaReferenceSchema,
  purpose: declare(string(), {
    description: "One line stating what the workspace holds.",
    optional: { value: undefined },
  }),
});
