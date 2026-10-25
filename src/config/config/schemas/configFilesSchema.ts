import { array, optional } from "valibot";

import { globSchema } from "#config/config/schemas/globSchema";
import { defaultConfigFiles } from "#config/constants";

export const configFilesSchema = optional(
  array(globSchema),
  defaultConfigFiles,
);
