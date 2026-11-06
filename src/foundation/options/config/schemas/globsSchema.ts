import { array, union, type GenericSchema } from "valibot";

import { globSchema } from "#foundation/options/config/schemas/globSchema";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export const globsSchema: GenericSchema<Glob | Globs> = union([
  globSchema,
  array(globSchema),
]);
