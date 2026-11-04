import { declareObject } from "#foundation/options/utils/declareObject";
import { declareCodeEnvironment } from "#project/environments/config/declareCodeEnvironment";
import {
  defaultScriptsDirectories,
  disabledCodeEnvironment,
} from "#project/environments/constants";
import { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";

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
