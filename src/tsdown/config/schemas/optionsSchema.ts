import { array, optional, pipe, readonly, strictObject, string } from "valibot";

export const optionsSchema = strictObject({
  bundle: optional(pipe(array(string()), readonly()), []),
});
