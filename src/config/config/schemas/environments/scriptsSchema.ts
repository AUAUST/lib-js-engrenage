import {
  defaultScriptsDirectories,
  disabledCodeEnvironment,
} from "#config/constants";
import { createCodeEnvironment } from "#config/utils/createCodeEnvironment";
import { declareObject } from "#foundation/options/utils/declareObject";
import { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";

export const scriptsSchema = declareObject(
  {
    ...createCodeEnvironment("scripts", defaultScriptsDirectories),
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
