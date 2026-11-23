import { omitRolesSchema, rolesSchema } from "#batiment/roles/index";
import { declareLayout } from "#batiment/scopes/index";
import { declareObject } from "#foundation/options/index";
import { declareCodeEnvironment } from "#project/environments/config/declarers/declareCodeEnvironment";
import {
  defaultScriptsDirectories,
  disabledCodeEnvironment,
} from "#project/environments/constants";

export const scriptsSchema = declareObject(
  {
    ...declareCodeEnvironment("scripts", {
      dirs: defaultScriptsDirectories,
    }),
    layout: declareLayout(),
    roles: rolesSchema,
    omitRoles: omitRolesSchema,
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
