import { declareList } from "#foundation/options/config/declareList";
import { directorySchema } from "#foundation/options/config/schemas/directorySchema";
import { globSchema } from "#foundation/options/config/schemas/globsSchema";
import { declareObject } from "#foundation/options/utils/declareObject";
import {
  defaultToolingDirectories,
  defaultToolingFiles,
} from "#project/environments/constants";
import { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";
import { structureOptions } from "#project/structure/config/schemas/structureOptions";
import { declareEnvironmentTsconfig } from "#project/tsconfig/config/declareEnvironmentTsconfig";
import { unmanagedTsconfig } from "#project/tsconfig/index";

export const toolingSchema = declareObject(
  {
    ...structureOptions,
    dirs: declareList(directorySchema, {
      description:
        "Directories of the tooling environment: all their TypeScript files are included and walked like `src`. `.` contributes only the files matched by `files`.",
      optional: { value: defaultToolingDirectories },
    }),
    files: declareList(globSchema, {
      description:
        "Globs, matched at the project root only, of the root files of the tooling environment, such as configuration files. They apply when `dirs` includes `.`.",
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
