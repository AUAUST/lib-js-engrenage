import { declareLanguages } from "#batiment/environments/config/declarers/declareLanguages";
import { schemaReferenceSchema } from "#batiment/scopes/index";
import { declareObject } from "#foundation/options/index";

export const environmentMetadataSchema = declareObject({
  $schema: schemaReferenceSchema,
  languages: declareLanguages(
    "Names of the registered languages the environment holds; overrides its options' and its kind's `languages`.",
  ),
}).schema;
