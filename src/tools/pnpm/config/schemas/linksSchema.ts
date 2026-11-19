import { record, string } from "valibot";

import { linkSchema } from "#tools/pnpm/config/schemas/linkSchema";

// @debt a schema of a local state file, not of an option declaration; no role fits schemas of data files
export const linksSchema = record(string(), linkSchema);
