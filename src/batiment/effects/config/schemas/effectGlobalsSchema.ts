import { record, string } from "valibot";

import { effectGlobalSchema } from "#batiment/effects/config/schemas/effectGlobalSchema";

export const effectGlobalsSchema = record(string(), effectGlobalSchema);
