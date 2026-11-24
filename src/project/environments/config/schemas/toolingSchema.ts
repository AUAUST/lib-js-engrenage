import { declareLanguages } from "#batiment/environments/index";
import { omitRolesSchema, rolesSchema } from "#batiment/roles/index";
import { declareStructureOptions } from "#batiment/scopes/index";
import {
  declareList,
  declareObject,
  directorySchema,
  globSchema,
} from "#foundation/options/index";
import {
  defaultToolingDirectories,
  defaultToolingFiles,
} from "#project/environments/constants";

export const toolingSchema = declareObject(
  {
    ...declareStructureOptions(),
    languages: declareLanguages(
      'Registered languages the environment holds, each a name or a selection with options such as `typescript({ tsx: "solid" })`; defaults to its kind\'s `languages`.',
    ),
    dirs: declareList(directorySchema, {
      description: "Directories of the tooling environment: all their files of the languages it selects (`languages`) are included and walked like `src`. `.` contributes only the files matched by `files`.",
      optional: { value: defaultToolingDirectories },
    }),
    files: declareList(globSchema, {
      description: "Globs, matched at the project root only, of the root files of the tooling environment, such as configuration files. They apply when `dirs` includes `.`.",
      optional: { value: defaultToolingFiles },
    }),
    roles: rolesSchema,
    omitRoles: omitRolesSchema,
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
      },
    },
  },
);
