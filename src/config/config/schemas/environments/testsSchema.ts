import { description, optional, pipe, strictObject } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { environmentTsconfigSchema } from "#config/config/schemas/environments/environmentTsconfigSchema";
import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { environmentSchema } from "#config/config/schemas/values/environmentSchema";
import { globListSchema } from "#config/config/schemas/values/globListSchema";
import {
  defaultTestsCoverageDirectory,
  defaultTestsDirectories,
} from "#config/constants";
import { createCodeEnvironment } from "#config/utils/createCodeEnvironment";

export const testsSchema = pipe(
  environmentSchema({
    ...createCodeEnvironment("tests", defaultTestsDirectories),
    files: optional(
      pipe(
        globListSchema,
        description(
          join(
            [
              "Globs of the test files inside the tests directories, run by Vitest and linted with the test rules.",
              // @debt the glob defaults are described in words and hand-synced with their constants; the description could be derived from the constants
              "@default the `.test` and `.spec` TypeScript files at any depth",
            ],
            "\n",
          ),
        ),
      ),
    ),
    fixtures: optional(
      pipe(
        globListSchema,
        description(
          join(
            [
              "Globs of fixture files inside the tests directories, excluded from Vitest, from the tests tsconfig and from the test rules of ESLint.",
              "@default everything under a `fixtures` directory",
            ],
            "\n",
          ),
        ),
      ),
    ),
    coverageDir: optional(
      pipe(
        directorySchema,
        description(
          join(
            [
              "Directory of the Vitest coverage reports, ignored by Git and ESLint.",
              `@default \`${defaultTestsCoverageDirectory}\``,
            ],
            "\n",
          ),
        ),
      ),
    ),
    dist: optional(
      strictObject({
        tsconfig: optional(
          pipe(
            environmentTsconfigSchema,
            description(
              join(
                [
                  "Options of the tsconfig that checks the tests against the built output (`engrenage typecheck:dist`).",
                  "`false` manages none.",
                  // @debt the tests.dist tsconfig default was written from reading the code and not verified by running it
                  "@default `tsconfig.tests.dist.json` extending the tests tsconfig, not referenced by the base one",
                ],
                "\n",
              ),
            ),
          ),
        ),
      }),
    ),
  }),
  description(
    join(
      [
        "The tests environment, run by Vitest.",
        "`false` disables it, with its tsconfig and rules.",
      ],
      "\n",
    ),
  ),
);
