import {
  defaultScriptsDirectories,
  disabledCodeEnvironment,
} from "#config/constants";
import { declareCodeEnvironment } from "#environments/config/declareCodeEnvironment";
import { declareObject } from "#options/utils/declareObject";
import { rolesOptionSchema } from "#structure/config/schemas/rolesOptionSchema";

export const scriptsSchema = declareObject(
  {
    ...declareCodeEnvironment("scripts", defaultScriptsDirectories),
    roles: rolesOptionSchema,
  },
  {
    description: [
      "The environment of the maintenance scripts of the project, never published.",
      "`false` disables it.",
    ],
    optional: true,
    disable: { value: disabledCodeEnvironment },
  },
);
