import {
  declareList,
  declareObject,
  directorySchema,
  globSchema,
} from "#foundation/options/index";
import { declareStructureOptions } from "#project/environments/config/declarers/declareStructureOptions";
import {
  defaultToolingDirectories,
  defaultToolingFiles,
} from "#project/environments/constants";
import { rolesSchema } from "#project/roles/index";
import {
  declareEnvironmentTsconfig,
  unmanagedTsconfig,
} from "#project/tsconfig/index";

export const toolingSchema = declareObject(
  {
    ...declareStructureOptions(),
    dirs: declareList(directorySchema, {
      description: "Directories of the tooling environment: all their TypeScript files are included and walked like `src`. `.` contributes only the files matched by `files`.",
      optional: { value: defaultToolingDirectories },
    }),
    files: declareList(globSchema, {
      description: "Globs, matched at the project root only, of the root files of the tooling environment, such as configuration files. They apply when `dirs` includes `.`.",
      optional: { value: defaultToolingFiles },
    }),
    roles: rolesSchema,
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
