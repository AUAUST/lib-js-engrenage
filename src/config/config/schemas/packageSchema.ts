import { object, string } from "valibot";

export const packageSchema = object({
  name: string(),
  version: string(),
});
