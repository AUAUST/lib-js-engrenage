import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { globSchema } from "#config/config/schemas/values/globsSchema";
import {
  defaultToolingDirectories,
  defaultToolingFiles,
  unmanagedTsconfig,
} from "#config/constants";
import { declareEnvironmentTsconfig } from "#config/utils/declareEnvironmentTsconfig";
import { declareList } from "#config/utils/declareList";
import { declareObject } from "#foundation/options/utils/declareObject";
import { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";
import { structureOptions } from "#project/structure/config/schemas/structureOptions";

export const toolingSchema = declareObject(
  {
    ...structureOptions,
    dirs: declareList(directorySchema, {
      description: "Directories searched for tooling files.",
      optional: { value: defaultToolingDirectories },
    }),
    files: declareList(globSchema, {
      description:
        "Globs of tooling files inside the tooling directories, such as configuration files.",
      optional: { value: defaultToolingFiles },
    }),
    roles: rolesOptionSchema,
    tsconfig: declareEnvironmentTsconfig("tooling", {
      description: [
        "Options of the tsconfig that sync writes for the tooling files.",
        "`false` manages none.",
      ],
      explain: "it shares the scripts tsconfig",
    }),
  },
  {
    description: [
      "The environment of the tooling configuration files at the project root.",
      "`false` disables it.",
    ],
    optional: true,
    disable: {
      value: {
        dirs: [],
        files: [],
        tsconfig: unmanagedTsconfig,
      },
    },
  },
);
