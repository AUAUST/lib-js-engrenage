import { string } from "valibot";

import { omit } from "@auaust/toolkit/object";

import { declareLanguages } from "#batiment/environments/config/declarers/declareLanguages";
import {
  declareStructureNodes,
  schemaReferenceSchema,
} from "#batiment/scopes/index";
import { declare, declareObject } from "#foundation/options/index";

export const environmentMetadataSchema = declareObject({
  $schema: schemaReferenceSchema,
  kind: declare(string(), {
    description: "Kind of the environment, naming an `environmentKinds` entry. Unset in a workspace's environment, its directory name.",
    optional: { value: undefined },
  }),
  languages: declareLanguages(
    "Names of the registered languages the environment holds; overrides its options' and its kind's `languages`.",
  ),
  ...omit(declareStructureNodes().metadata.namespace.entries, "$schema"),
}).schema;
