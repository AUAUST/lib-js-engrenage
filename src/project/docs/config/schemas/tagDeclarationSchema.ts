import {
  array,
  boolean,
  custom,
  exactOptional,
  picklist,
  pipe,
  readonly,
  strictObject,
  string,
} from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { isObject } from "@auaust/toolkit/isObject";

function isStandardSchema(value: unknown): value is StandardSchemaV1<string> {
  return isObject(value) && "~standard" in value;
}

export const tagDeclarationSchema = strictObject({
  name: string(),
  type: exactOptional(picklist(["required", "optional"])),
  subject: exactOptional(picklist(["parameter", "typeParameter", "name"])),
  body: picklist(["none", "inline", "text", "code"]),
  schema: exactOptional(
    custom<StandardSchemaV1<string>>(
      isStandardSchema,
      "Expected a Standard Schema",
    ),
  ),
  multiple: exactOptional(boolean()),
  excludes: exactOptional(pipe(array(string()), readonly())),
  scope: exactOptional(picklist(["signature", "export"])),
  output: exactOptional(picklist(["public", "internal"])),
});
