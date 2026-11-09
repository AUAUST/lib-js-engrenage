import { boolean } from "valibot";

import {
  declare,
  declareList,
  declareObject,
  directorySchema,
  globSchema,
} from "#foundation/options/index";
import { declareCodeEnvironment } from "#project/environments/config/declarers/declareCodeEnvironment";
import {
  defaultTestsCoverageDirectory,
  defaultTestsDirectories,
  defaultTestsExtension,
  defaultTestsFixtures,
  defaultTestsLocation,
  defaultTestsSuffix,
  disabledCodeEnvironment,
} from "#project/environments/constants";
import { rolesSchema } from "#project/roles/index";
import {
  declareEnvironmentTsconfig,
  unmanagedTsconfig,
} from "#project/tsconfig/index";

export const testsSchema = declareObject(
  {
    ...declareCodeEnvironment("tests", {
      dirs: defaultTestsDirectories,
      defines: true,
    }),
    roles: rolesSchema,
    mirror: declare(boolean(), {
      description: [
        "Whether each directory below a tests root key (a directory named after a code environment: `src`, `bin`, `scripts`, `tooling`) must exist in the structure of the environment it is named after.",
        "`false` accepts any directory there.",
      ],
      optional: { value: false },
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
          explain:
            "`tsconfig.tests.dist.json` extending the tests tsconfig, not referenced by the base one; none without the `published` trait",
          managed(context: { readonly published: boolean }) {
            return context.published;
          },
          checked: false,
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
    renamed: {
      layout: "mirror",
    },
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
