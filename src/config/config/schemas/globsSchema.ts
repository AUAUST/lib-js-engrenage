import { array, type GenericSchema } from "valibot";

import { globSchema } from "#config/config/schemas/globSchema";
import type { Globs } from "#types/Glob";

export const globsSchema: GenericSchema<Globs> = array(globSchema);
