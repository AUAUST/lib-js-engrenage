import { omitRolesSchema, rolesSchema } from "#batiment/roles/index";
import { declareObject } from "#foundation/options/index";
import { declareCodeEnvironment } from "#project/environments/config/declarers/declareCodeEnvironment";
import { declareProgramLayout } from "#project/environments/config/declarers/declareProgramLayout";
import {
  defaultScriptsDirectories,
  disabledCodeEnvironment,
} from "#project/environments/constants";

export const scriptsSchema = declareObject(
  {
    ...declareCodeEnvironment("scripts", {
      dirs: defaultScriptsDirectories,
    }),
    tree: declareProgramLayout(),
    roles: rolesSchema,
    omitRoles: omitRolesSchema,
  },
  {
    description: [
      "The environment of the maintenance scripts of the project, never published.",
      "`false` disables it.",
    ],
    optional: true,
    renamed: { layout: "tree" },
    disable: { value: disabledCodeEnvironment },
  },
);
