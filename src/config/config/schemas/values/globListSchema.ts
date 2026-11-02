import { globSchema } from "#config/config/schemas/values/globsSchema";
import { listOptionSchema } from "#config/config/schemas/values/listOptionSchema";

export const globListSchema = listOptionSchema(globSchema);
