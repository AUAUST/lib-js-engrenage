import { object, record, string } from "valibot";

// @debt a schema of a local state file, not of an option declaration; no role fits schemas of data files
export const linksSchema = record(
  string(),
  object({
    directory: string(),
    installed: string(),
  }),
);
