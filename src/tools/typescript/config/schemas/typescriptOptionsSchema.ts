import { optional, picklist, strictObject } from "valibot";

import { keys } from "@auaust/toolkit/object";

import { jsxFlavours } from "#tools/typescript/constants";

export const typescriptOptionsSchema = strictObject({
  tsx: optional(picklist(keys(jsxFlavours))),
});
