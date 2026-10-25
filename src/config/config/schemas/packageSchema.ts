import { nullish, object, string } from "valibot";

export const packageSchema = object({
  name: nullish(string(), null),
  version: nullish(string(), null),
});
