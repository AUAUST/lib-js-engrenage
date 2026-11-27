import { object, string, union } from "valibot";

export const effectLevelSchema = union([
  string(),
  object({
    name: string(),
    purpose: string(),
  }),
]);
