import { description, optional, pipe, strictObject } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { environmentTsconfigSchema } from "#config/config/schemas/environments/environmentTsconfigSchema";
import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { environmentSchema } from "#config/config/schemas/values/environmentSchema";
import { globListSchema } from "#config/config/schemas/values/globListSchema";
import { globSchema } from "#config/config/schemas/values/globsSchema";
import {
  defaultTestsCoverageDirectory,
  defaultTestsDirectories,
  defaultTestsExtension,
  defaultTestsLocation,
  defaultTestsSuffix,
} from "#config/constants";
import { createCodeEnvironment } from "#config/utils/createCodeEnvironment";
import { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";

export const testsSchema = pipe(
  environmentSchema({
    ...createCodeEnvironment("tests", defaultTestsDirectories),
    roles: optional(rolesOptionSchema),
    location: optional(
      pipe(
        globSchema,
        description(
          join(
            [
              "Glob of the directories holding test files, the first part of the test file patterns.",
              `@default \`${defaultTestsLocation}\``,
            ],
            "\n",
          ),
        ),
      ),
    ),
    suffix: optional(
      pipe(
        globSchema,
        description(
          join(
            [
              "Glob of the suffix that marks a test file, the second part of the test file patterns.",
              `@default \`${defaultTestsSuffix}\``,
            ],
            "\n",
          ),
        ),
      ),
    ),
    extension: optional(
      pipe(
        globSchema,
        description(
          join(
            [
              "Glob of the extensions of test files, the last part of the test file patterns.",
              "Location, suffix and extension combine into the pattern of plain test files (`x.test.ts`), run by Vitest in every mode, and into those of the `.src` and `.dist` variants, run in source and dist mode only; all three are linted with the test rules.",
              `@default \`${defaultTestsExtension}\``,
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
