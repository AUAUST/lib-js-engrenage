import { record, string } from "valibot";

import { effectRankSchema } from "#batiment/effects/config/schemas/effectRankSchema";

export const effectRanksSchema = record(string(), effectRankSchema);
