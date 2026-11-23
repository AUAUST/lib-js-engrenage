import { record, string } from "valibot";

import { omitRolesSchema, rolesSchema } from "#batiment/roles/index";
import { declareLayout } from "#batiment/scopes/index";
import {
  declare,
  declareObject,
  fileSchema,
  unset,
} from "#foundation/options/index";
import { declareCodeEnvironment } from "#project/environments/config/declarers/declareCodeEnvironment";
import {
  defaultBinDirectories,
  disabledCodeEnvironment,
} from "#project/environments/constants";

export const binSchema = declareObject(
  {
    ...declareCodeEnvironment("bin", {
      dirs: defaultBinDirectories,
    }),
    layout: declareLayout(),
    roles: rolesSchema,
    omitRoles: omitRolesSchema,
    entries: declare(record(string(), fileSchema), {
      description: [
        "Commands the package exposes, mapped to their entry file.",
        "They feed the tsdown entries and the `bin` field of `package.json`.",
      ],
      optional: unset("the entry files found in the bin directories"),
    }),
  },
  {
    description: [
      "The environment of the command-line entries of the package.",
      "`false` disables it.",
    ],
    optional: true,
    renamed: {
      commands: "entries",
    },
    disable: {
      value: {
        ...disabledCodeEnvironment,
        entries: undefined,
      },
    },
  },
);
