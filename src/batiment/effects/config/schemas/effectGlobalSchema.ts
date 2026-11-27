import { optional, strictObject, string, union } from "valibot";

import { effectRankSchema } from "#batiment/effects/config/schemas/effectRankSchema";

export const effectGlobalSchema = union([
  effectRankSchema,
  strictObject({
    unit: string(),
    member: optional(string()),
  }),
]);
