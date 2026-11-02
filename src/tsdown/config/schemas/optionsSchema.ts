import {
  array,
  boolean,
  optional,
  picklist,
  pipe,
  readonly,
  record,
  strictObject,
  string,
} from "valibot";

import { pluginNames } from "#tsdown/constants";

export const optionsSchema = strictObject({
  bundle: optional(pipe(array(string()), readonly()), []),
  plugins: optional(record(picklist(pluginNames), boolean()), {}),
});
