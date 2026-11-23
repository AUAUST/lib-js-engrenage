import { array, union, type GenericSchema } from "valibot";

import { globSchema } from "#foundation/options/index";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export const roleGlobsSchema: GenericSchema<Glob | Globs> = union(
  [globSchema, array(globSchema)],
  "Expected a glob or a list of globs, placeholders such as `<domain>` filled per location",
);
