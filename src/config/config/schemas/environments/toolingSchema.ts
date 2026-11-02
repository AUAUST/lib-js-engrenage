import { description, optional, pipe } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { environmentTsconfigSchema } from "#config/config/schemas/environments/environmentTsconfigSchema";
import { dirsSchema } from "#config/config/schemas/values/dirsSchema";
import { environmentSchema } from "#config/config/schemas/values/environmentSchema";
import { globListSchema } from "#config/config/schemas/values/globListSchema";
import {
  defaultToolingDirectories,
  defaultToolingFiles,
} from "#config/constants";
import { listDefaults } from "#config/utils/listSchemaDefaults";

export const toolingSchema = pipe(
  environmentSchema({
    dirs: optional(
      pipe(
        dirsSchema,
        description(
          join(
            [
              "Directories searched for tooling files.",
              `@default ${listDefaults(defaultToolingDirectories)}`,
            ],
            "\n",
          ),
        ),
      ),
    ),
    files: optional(
      pipe(
        globListSchema,
        description(
          join(
            [
              "Globs of tooling files inside the tooling directories, such as configuration files.",
              `@default ${listDefaults(defaultToolingFiles)}`,
            ],
            "\n",
          ),
        ),
      ),
    ),
    tsconfig: optional(
      pipe(
        environmentTsconfigSchema,
        description(
          join(
            [
              "Options of the tsconfig that sync writes for the tooling files.",
              "`false` manages none.",
              "@default it shares the scripts tsconfig",
            ],
            "\n",
          ),
        ),
      ),
    ),
  }),
  description(
    join(
      [
        "The environment of the tooling configuration files at the project root.",
        "`false` disables it.",
      ],
      "\n",
    ),
  ),
);
