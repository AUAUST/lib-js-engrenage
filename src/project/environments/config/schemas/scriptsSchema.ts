import { declareObject } from "#foundation/options/index";
import {
  defaultScriptsDirectories,
  disabledCodeEnvironment,
} from "#project/environments/constants";
import { declareCodeEnvironment } from "#project/environments/declarers/declareCodeEnvironment";
import { declareProgramLayout } from "#project/environments/declarers/declareProgramLayout";
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
