import { agentsSchema } from "#config/config/schemas/agentsSchema";
import { directoriesSchema } from "#config/config/schemas/directoriesSchema";
import { filesSchema } from "#config/config/schemas/filesSchema";
import { strictObject } from "valibot";

export const configSchema = strictObject({
  directories: directoriesSchema,
  files: filesSchema,
  agents: agentsSchema,
});
