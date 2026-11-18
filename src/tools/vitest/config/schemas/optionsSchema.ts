import {
  array,
  boolean,
  optional,
  picklist,
  record,
  strictObject,
  string,
} from "valibot";

import { pluginNames } from "#tools/vitest/constants";

export const optionsSchema = strictObject({
  isolate: optional(boolean(), true),
  restoreMocks: optional(boolean()),
  plugins: optional(record(picklist(pluginNames), boolean()), {}),
  setupFiles: optional(array(string())),
});
