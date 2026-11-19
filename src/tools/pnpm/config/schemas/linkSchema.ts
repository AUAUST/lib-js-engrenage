import { object, string } from "valibot";

// @debt a schema of a local state file, not of an option declaration; no role fits schemas of data files
export const linkSchema = object({
  package: string(),
  directory: string(),
  installed: string(),
});
