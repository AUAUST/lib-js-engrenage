import { strictObject } from "valibot";

import { binsSchema } from "#tsdown/config/schemas/binsSchema";
import { bundleSchema } from "#tsdown/config/schemas/bundleSchema";
import { fileExportsSchema } from "#tsdown/config/schemas/fileExportsSchema";

export const optionsSchema = strictObject({
  bins: binsSchema,
  fileExports: fileExportsSchema,
  bundle: bundleSchema,
});
