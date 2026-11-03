import { boolean, description, optional, pipe } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { environmentTsconfigSchema } from "#config/config/schemas/environments/environmentTsconfigSchema";
import { dirsSchema } from "#config/config/schemas/values/dirsSchema";
import { globListSchema } from "#config/config/schemas/values/globListSchema";
import { defaultDefines } from "#config/constants";
import { listDefaults } from "#config/utils/listSchemaDefaults";
import { structureOptions } from "#project/structure/config/schemas/structureOptions";
import type { Directories } from "#types/Directories";

export function createCodeEnvironment(
  name: "src" | "tests" | "bin" | "scripts",
  defaultDirs: Directories,
) {
  return {
    ...structureOptions,
    dirs: optional(
      pipe(
        dirsSchema,
        description(
          join(
            [
              `Directories of the ${name} environment: its TypeScript files (\`typescript.files\`) are included in its tsconfig, linted with its rules and, for \`src\` and \`bin\`, published.`,
              "The environment is inactive when none exists.",
              `@default ${listDefaults(defaultDirs)}`,
            ],
            "\n",
          ),
        ),
      ),
    ),
    generated: optional(
      pipe(
        globListSchema,
        description(
          join(
            [
              `Globs, inside the ${name} directories, of files produced by tools.`,
              "They are ignored by ESLint's generated-file rules and listed in the Prettier ignore file.",
              "@default none",
            ],
            "\n",
          ),
        ),
      ),
    ),
    discovered: optional(
      pipe(
        globListSchema,
        description(
          join(
            [
              `Globs, inside the ${name} directories, of files that tools discover by path and that may export defaults.`,
              "ESLint lifts its default-export restriction for them.",
              "@default none",
            ],
            "\n",
          ),
        ),
      ),
    ),
    defines: optional(
      pipe(
        boolean(),
        description(
          join(
            [
              `Whether the ${name} tsconfig includes the env file declaring the \`define.values\` globals.`,
              `@default \`${defaultDefines[name]}\``,
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
              `Options of the tsconfig that sync writes for the ${name} environment.`,
              "`false` manages none.",
              `@default \`tsconfig.${name}.json\` with derived options`,
            ],
            "\n",
          ),
        ),
      ),
    ),
  };
}
