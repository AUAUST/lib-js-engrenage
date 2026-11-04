import { array, string, union, type GenericSchema } from "valibot";

import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export const globSchema: GenericSchema<Glob> = string();

export const globsSchema: GenericSchema<Glob | Globs> = union([
  globSchema,
  array(globSchema),
]);
