import { strictObject } from "valibot";

import { agentsSchema } from "#config/config/schemas/agentsSchema";
import { directoriesSchema } from "#config/config/schemas/directoriesSchema";
import { filesSchema } from "#config/config/schemas/filesSchema";

export const configSchema = strictObject({
  directories: directoriesSchema,
  files: filesSchema,
  agents: agentsSchema,
});
