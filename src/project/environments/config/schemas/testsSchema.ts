import { picklist } from "valibot";

import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { declareList } from "#project/config/config/declareList";
import { directorySchema } from "#project/config/config/schemas/values/directorySchema";
import { globSchema } from "#project/config/config/schemas/values/globsSchema";
import {
  defaultTestsCoverageDirectory,
  defaultTestsDirectories,
  defaultTestsExtension,
  defaultTestsFixtures,
  defaultTestsLocation,
  defaultTestsSuffix,
  disabledCodeEnvironment,
  unmanagedTsconfig,
} from "#project/config/constants";
import { declareCodeEnvironment } from "#project/environments/config/declareCodeEnvironment";
import { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";
import { declareEnvironmentTsconfig } from "#project/tsconfig/config/declareEnvironmentTsconfig";

export const testsSchema = declareObject(
  {
    ...declareCodeEnvironment("tests", defaultTestsDirectories),
    roles: rolesOptionSchema,
    layout: declare(picklist(["roots", "mirror"]), {
      description: [
        "How the directories below a tests root key (a directory named after a code environment: `src`, `bin`, `scripts`, `tooling`) are classified.",
        "`roots` accepts any directory there; `mirror` requires each to exist in the structure of the environment it is named after.",
      ],
      optional: { value: "roots" },
    }),
    location: declare(globSchema, {
      description:
        "Glob of the directories holding test files, the first part of the test file patterns.",
      optional: { value: defaultTestsLocation },
    }),
    suffix: declare(globSchema, {
      description:
        "Glob of the suffix that marks a test file, the second part of the test file patterns.",
      optional: { value: defaultTestsSuffix },
    }),
    extension: declare(globSchema, {
      description: [
        "Glob of the extensions of test files, the last part of the test file patterns.",
        "Location, suffix and extension combine into the pattern of plain test files (`x.test.ts`), run by Vitest in every mode, and into those of the `.src` and `.dist` variants, run in source and dist mode only; all three are linted with the test rules.",
      ],
      optional: { value: defaultTestsExtension },
    }),
    fixtures: declareList(globSchema, {
      description:
        "Globs of fixture files inside the tests directories, excluded from Vitest, from the tests tsconfig and from the test rules of ESLint.",
      optional: {
        explain: "everything under a `fixtures` directory",
        compute() {
          return defaultTestsFixtures;
        },
      },
    }),
    coverageDir: declare(directorySchema, {
      description:
        "Directory of the Vitest coverage reports, ignored by Git and ESLint.",
      optional: { value: defaultTestsCoverageDirectory },
    }),
    dist: declareObject(
      {
        tsconfig: declareEnvironmentTsconfig("tests.dist", {
          description: [
            "Options of the tsconfig that checks the tests against the built output (`engrenage typecheck:dist`).",
            "`false` manages none.",
          ],
          // @debt the tests.dist tsconfig default was written from reading the code and not verified by running it
          explain:
            "`tsconfig.tests.dist.json` extending the tests tsconfig, not referenced by the base one",
        }),
      },
      {
        optional: true,
      },
    ),
  },
  {
    description: [
      "The tests environment, run by Vitest.",
      "`false` disables it, with its tsconfig and rules.",
    ],
    optional: true,
    disable: {
      value: {
        ...disabledCodeEnvironment,
        fixtures: [],
        coverageDir: defaultTestsCoverageDirectory,
        dist: { tsconfig: unmanagedTsconfig },
      },
    },
  },
);
