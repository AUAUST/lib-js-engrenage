import {
  array,
  optional,
  pipe,
  readonly,
  record,
  strictObject,
  string,
} from "valibot";

import { globsSchema } from "#config/config/schemas/globsSchema";

export const optionsSchema = strictObject({
  customExports: optional(record(string(), globsSchema), {}),
  bundle: optional(pipe(array(string()), readonly()), []),
});
