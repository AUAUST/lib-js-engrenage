import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { listOptionSchema } from "#config/config/schemas/values/listOptionSchema";

export const dirsSchema = listOptionSchema(directorySchema);
