import { boolean, optional, strictObject } from "valibot";

export const optionsSchema = strictObject({
  guardOutDir: optional(boolean(), true),
});
