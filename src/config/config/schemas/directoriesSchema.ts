import { array, type GenericSchema } from "valibot";

import { directorySchema } from "#config/config/schemas/directorySchema";
import type { Directory } from "#types/Directory";

export const directoriesSchema: GenericSchema<readonly Directory[]> =
  array(directorySchema);
