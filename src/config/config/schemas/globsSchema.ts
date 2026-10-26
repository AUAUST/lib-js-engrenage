import { array, type GenericSchema } from "valibot";

import { globSchema } from "#config/config/schemas/globSchema";
import type { Glob } from "#types/Glob";

export const globsSchema: GenericSchema<readonly Glob[]> = array(globSchema);
