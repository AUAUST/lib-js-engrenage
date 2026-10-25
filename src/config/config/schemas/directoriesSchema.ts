import { array, type GenericSchema } from "valibot";

import { directorySchema } from "#config/config/schemas/directorySchema";
import type { Directories } from "#types/Directory";

export const directoriesSchema: GenericSchema<Directories> =
  array(directorySchema);
