import { array, optional } from "valibot";

import { directorySchema } from "#config/config/schemas/directorySchema";
import { defaultTestDirectories } from "#config/constants";

export const testDirectoriesSchema = optional(
  array(directorySchema),
  defaultTestDirectories,
);
