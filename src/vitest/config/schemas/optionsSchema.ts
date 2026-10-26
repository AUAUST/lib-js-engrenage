import { boolean, optional, strictObject } from "valibot";

export const optionsSchema = strictObject({
  isolate: optional(boolean(), false),
  restoreMocks: optional(boolean()),
  guardOutDir: optional(boolean(), true),
});
