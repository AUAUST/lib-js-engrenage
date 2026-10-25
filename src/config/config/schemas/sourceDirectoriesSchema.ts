import { array, optional } from "valibot";

import { directorySchema } from "#config/config/schemas/directorySchema";
import { defaultSourceDirectories } from "#config/constants";

export const sourceDirectoriesSchema = optional(
  array(directorySchema),
  defaultSourceDirectories,
);
