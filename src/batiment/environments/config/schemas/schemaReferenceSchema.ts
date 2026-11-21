import { optional, string } from "valibot";

import { freeze } from "@auaust/toolkit/object";

import { validate, type Declaration } from "#foundation/options/index";

const schemaReference = optional(string());

function resolveSchemaReference(
  input: unknown,
  _context: unknown,
  path: string,
): string | undefined {
  return validate(schemaReference, input, path);
}

export const schemaReferenceSchema: Declaration<
  string | undefined,
  string | undefined,
  unknown
> = freeze({
  schema: schemaReference,
  resolve: resolveSchemaReference,
});
