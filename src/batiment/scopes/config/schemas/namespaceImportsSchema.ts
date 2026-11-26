import {
  array,
  minLength,
  pipe,
  record,
  strictObject,
  string,
  union,
} from "valibot";

import { namespaceKindFields } from "#batiment/scopes/constants";

const relationSchema = namespaceKindFields.imports.wrapped.value;

export const namespaceImportsSchema = record(
  string(),
  union([
    relationSchema,
    strictObject({
      relation: relationSchema,
      dirs: pipe(array(string()), minLength(1)),
    }),
  ]),
);
