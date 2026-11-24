import { boolean, record, string, unknown } from "valibot";

import {
  declare,
  declareList,
  declareManagedList,
  declareObject,
  fileSchema,
  unset,
  type Description,
} from "#foundation/options/index";

export function declareEnvironmentTsconfig<Context = unknown>(options: {
  description: Description;
  explain: string;
  managed?(context: Context): boolean;
  checked?: boolean;
}) {
  const { checked = true } = options;

  return declareObject(
    {
      path: declare(fileSchema, {
        description: "File of this tsconfig.",
        optional: unset(
          "`tsconfig.<environment>.json`, named after its environment",
        ),
      }),
      extends: declareManagedList(string(), {
        description: [
          "Value of `extends`.",
          "`false` leaves the field to the file.",
        ],
        explain: "the base tsconfig (the `tests` tsconfig for `tests.dist`)",
      }),
      include: declareManagedList(string(), {
        description: [
          "Value of `include`.",
          "`false` leaves the field to the file.",
        ],
        explain: "the TypeScript files of the environment, from its placements in the root scope, plus `src`'s `env.d.ts` for `tests` and the environments importing `src`; for `tests.dist`, only the plain and `.dist` test files, the setup file and the declarations at any depth, so no `.src` test brings source into the dist check; every tsconfig adds the root `global.d.ts` when it exists",
      }),
      exclude: declareManagedList(string(), {
        description: [
          "Value of `exclude`.",
          "`false` leaves the field to the file.",
        ],
        explain: "the test fixtures for a tsconfig that includes tests, and the directories other environments are placed on below the environment's directories",
      }),
      lib: declareManagedList(string(), {
        description: [
          "Value of `compilerOptions.lib`.",
          "`false` leaves the field to the file.",
        ],
        explain: "the ES libs selected from the registration's Baseline syntax snapshot, `ESNext` for a Node runtime",
      }),
      types: declareManagedList(string(), {
        description: [
          "Value of `compilerOptions.types`.",
          "`false` leaves the field to the file.",
        ],
        explain: "`node` for a Node runtime; for a baseline runtime, `@auaust/engrenage/apis/<group>` for each group of its environment's `execution.apis`, except library groups whose lib is already in `lib`, which are left out with a warning",
      }),
      compilerOptions: declare(record(string(), unknown()), {
        description: "Options written into `compilerOptions` after the ones engrenage derives; it wins over them.",
        optional: {
          value: {},
        },
      }),
      unmanaged: declareList(string(), {
        description: "Dotted paths in this tsconfig (such as `compilerOptions.paths`) that sync never writes.",
        optional: { value: [] },
      }),
      check: declare(boolean(), {
        description: "Whether the base tsconfig references this tsconfig, so `engrenage typecheck` checks it.",
        optional: {
          explain: "`true`, except for `tests.dist`",
          compute() {
            return checked;
          },
        },
      }),
    },
    {
      description: options.description,
      optional: {
        explain: options.explain,
        compute(context: Context) {
          if (options.managed?.(context) === false) {
            return false;
          }

          return {};
        },
      },
      disable: {
        value: {},
      },
    },
  );
}
