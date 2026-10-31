import {
  boolean,
  literal,
  optional,
  picklist,
  record,
  strictObject,
  string,
  union,
  unknown,
} from "valibot";

import { fileSchema } from "#config/config/schemas/fileSchema";
import { listOptionSchema } from "#config/config/schemas/listOptionSchema";
import { managedListOptionSchema } from "#config/config/schemas/managedListOptionSchema";
import { tsconfigEnvironments } from "#config/constants";

export const environmentTsconfigSchema = union([
  literal(false),
  strictObject({
    path: optional(fileSchema),
    inherits: optional(picklist(tsconfigEnvironments)),
    extends: optional(managedListOptionSchema(string())),
    include: optional(managedListOptionSchema(string())),
    lib: optional(managedListOptionSchema(string())),
    types: optional(managedListOptionSchema(string())),
    compilerOptions: optional(record(string(), unknown())),
    unmanaged: optional(listOptionSchema(string())),
    check: optional(boolean()),
  }),
]);
