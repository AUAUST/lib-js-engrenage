import { defaultSourceDirectories } from "#config/constants";
import { directorySchema } from "#config/config/schemas/directorySchema";
import { array, optional } from "valibot";

export const sourceDirectoriesSchema = optional(
  array(directorySchema),
  defaultSourceDirectories,
);
