import { pipe, regex, string } from "valibot";

export const roleNameSchema = pipe(
  string(),
  regex(/^[^/:]+$/, "A role name never contains `/` or `:`."),
);
