import { optional, strictObject, string, union } from "valibot";

export const effectCeilingsSchema = union([
  string(),
  strictObject({
    evaluation: optional(string()),
    invocation: optional(string()),
  }),
]);
