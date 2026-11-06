import { declareObject } from "#foundation/options/index";
import { declareCodeEnvironment } from "#project/environments/config/declarers/declareCodeEnvironment";
import { declareProgramLayout } from "#project/environments/config/declarers/declareProgramLayout";
import {
  defaultScriptsDirectories,
  disabledCodeEnvironment,
} from "#project/environments/constants";
import { rolesSchema } from "#project/roles/index";

export const scriptsSchema = declareObject(
  {
    ...declareCodeEnvironment("scripts", defaultScriptsDirectories),
    layout: declareProgramLayout(),
    roles: rolesSchema,
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
