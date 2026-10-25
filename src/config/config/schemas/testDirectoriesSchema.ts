import { defaultTestDirectories } from "#config/constants/defaultTestDirectories";
import { directorySchema } from "#config/config/schemas/directorySchema";
import { array, optional } from "valibot";

export const testDirectoriesSchema = optional(
  array(directorySchema),
  defaultTestDirectories,
);
