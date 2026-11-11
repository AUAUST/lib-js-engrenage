import { optional, picklist, strictObject, union } from "valibot";

import {
  roleExportStyles,
  roleTypeExportStyles,
  roleValueExportStyles,
} from "#project/roles/constants";

export const roleExportsSchema = union([
  picklist(roleExportStyles),
  strictObject({
    values: optional(picklist(roleValueExportStyles)),
    types: optional(picklist(roleTypeExportStyles)),
  }),
]);
