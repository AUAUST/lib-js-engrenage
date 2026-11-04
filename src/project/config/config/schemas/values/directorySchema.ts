import { array, string, union, type GenericSchema } from "valibot";

import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

export const directorySchema: GenericSchema<Directory> = string();

export const directoriesSchema: GenericSchema<Directory | Directories> = union([
  directorySchema,
  array(directorySchema),
]);
