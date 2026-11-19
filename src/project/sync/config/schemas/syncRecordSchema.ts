import { array, record, string } from "valibot";

// @debt a schema of a generated data file, not of an option declaration; no role fits schemas of data files
export const syncRecordSchema = record(string(), array(string()));
