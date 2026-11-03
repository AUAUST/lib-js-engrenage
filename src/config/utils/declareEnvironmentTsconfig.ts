import { boolean, picklist, record, string, unknown } from "valibot";

import { entries } from "@auaust/toolkit/object";

import {
  defaultTsconfigCheck,
  defaultTsconfigInherits,
  tsconfigEnvironments,
} from "#config/constants";
import { declareList } from "#config/utils/declareList";
import { declareLocation } from "#config/utils/declareLocation";
import { declareManagedList } from "#config/utils/declareManagedList";
import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { unset } from "#foundation/options/utils/unset";
import type { TsconfigEnvironment } from "#config/types/TsconfigEnvironment";
import type { TsconfigKey } from "#config/types/TsconfigKey";
import type { Description } from "#foundation/options/types/Description";

const inheritedDefaults: Readonly<
  Partial<Record<TsconfigKey, TsconfigEnvironment>>
> = defaultTsconfigInherits;

export function declareEnvironmentTsconfig(
  key: TsconfigKey,
  options: { description: Description; explain: string },
) {
  const inherits = inheritedDefaults[key];

  return declareObject(
    {
      path: declareLocation({
        description: "File of this tsconfig.",
        optional: {
          value: `tsconfig.${key}.json`,
          explain:
            "`tsconfig.<environment>.json`, named after the environment that owns it",
        },
      }),
      inherits: declare(picklist(tsconfigEnvironments), {
        description:
          "Environment whose tsconfig this one shares instead of having its own: its files and options apply here, so no other tsconfig option can be set alongside.",
        optional: unset("none, except `scripts` for `tooling`"),
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
        explain:
          "the TypeScript files of the environments that share this tsconfig, plus the env file when they define globals",
      }),
      exclude: declareManagedList(string(), {
        description: [
          "Value of `exclude`.",
          "`false` leaves the field to the file.",
        ],
        explain:
          "the test fixtures for a tsconfig that includes tests, nothing otherwise",
      }),
      lib: declareManagedList(string(), {
        description: [
          "Value of `compilerOptions.lib`.",
          "`false` leaves the field to the file.",
        ],
        explain:
          "the ES libs selected from `src.baseline` for a baseline runtime, `ESNext` for a Node runtime",
      }),
      types: declareManagedList(string(), {
        description: [
          "Value of `compilerOptions.types`.",
          "`false` leaves the field to the file.",
        ],
        explain:
          "`node` for a Node runtime; for a baseline runtime, `@auaust/engrenage/apis/<group>` for each `src.apis` group, except library groups whose lib is already in `lib`, which are left out with a warning",
      }),
      compilerOptions: declare(record(string(), unknown()), {
        description:
          "Options written into `compilerOptions` after the ones engrenage derives; it wins over them, `noLib` included.",
        optional: {
          value: {},
        },
      }),
      // @debt the unmanaged description was written from reading the code and not verified by running it
      unmanaged: declareList(string(), {
        description:
          "Dotted paths in this tsconfig (such as `compilerOptions.paths`) that sync never writes.",
        optional: { value: [] },
      }),
      check: declare(boolean(), {
        description:
          "Whether the base tsconfig references this tsconfig, so `engrenage typecheck` checks it.",
        optional: {
          explain: "`true`, except for `tests.dist`",
          compute() {
            return defaultTsconfigCheck[key];
          },
        },
      }),
    },
    {
      description: options.description,
      optional: {
        explain: options.explain,
        compute() {
          return inherits === undefined ? {} : { inherits };
        },
      },
      disable: {
        value: {},
      },
      assert(input, path) {
        const { inherits: shared, ...others } = input;

        if (shared === undefined) {
          return;
        }

        const conflicting = entries(others)
          .filter(([, value]) => value !== undefined)
          .map(([option]) => option);

        if (conflicting.length > 0) {
          throw new Error(
            `${path} inherits ${shared} and cannot also set ${conflicting.join(", ")}`,
          );
        }
      },
    },
  );
}
