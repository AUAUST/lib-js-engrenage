import {
  array,
  optional,
  pipe,
  readonly,
  record,
  strictObject,
  string,
} from "valibot";

import { fileSchema } from "#config/config/schemas/fileSchema";
import { globSchema } from "#config/config/schemas/globSchema";

export const optionsSchema = strictObject({
  bins: optional(record(string(), fileSchema), {}),
  fileExports: optional(record(string(), globSchema), {}),
  bundle: optional(pipe(array(string()), readonly()), []),
});
