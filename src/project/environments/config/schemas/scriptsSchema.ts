import { declareObject } from "#foundation/options/index";
import { declareCodeEnvironment } from "#project/environments/config/declareCodeEnvironment";
import { declareProgramLayout } from "#project/environments/config/declareProgramLayout";
import {
  defaultScriptsDirectories,
  disabledCodeEnvironment,
} from "#project/environments/constants";
import { rolesOptionSchema } from "#project/structure/index";

export const scriptsSchema = declareObject(
  {
    ...declareCodeEnvironment("scripts", defaultScriptsDirectories),
    layout: declareProgramLayout(),
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
