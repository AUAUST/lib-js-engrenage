import { string } from "valibot";

import { schemaReferenceSchema } from "#batiment/scopes/index";
import { declare, declareObject } from "#foundation/options/index";

export const environmentMetadataSchema = declareObject(
  {
    $schema: schemaReferenceSchema,
    environment: declare(string(), {
      description: "Name of the registered environment placed on the directory, covering its subtree.",
    }),
  },
  {
    removed: {
      languages: "tune the languages of the registered environment the metafile names",
    },
  },
).schema;
