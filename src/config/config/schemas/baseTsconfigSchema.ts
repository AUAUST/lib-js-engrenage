import { optional, record, strictObject, string, unknown } from "valibot";

import { fileSchema } from "#config/config/schemas/fileSchema";
import { listOptionSchema } from "#config/config/schemas/listOptionSchema";
import { managedListOptionSchema } from "#config/config/schemas/managedListOptionSchema";

export const baseTsconfigSchema = strictObject({
  path: optional(fileSchema),
  extends: optional(managedListOptionSchema(string())),
  compilerOptions: optional(record(string(), unknown())),
  unmanaged: optional(listOptionSchema(string())),
});
