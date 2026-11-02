import {
  boolean,
  description,
  literal,
  optional,
  picklist,
  pipe,
  record,
  strictObject,
  string,
  union,
  unknown,
} from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { fileSchema } from "#config/config/schemas/values/fileSchema";
import { listOptionSchema } from "#config/config/schemas/values/listOptionSchema";
import { managedListOptionSchema } from "#config/config/schemas/values/managedListOptionSchema";
import { tsconfigEnvironments } from "#config/constants";

export const environmentTsconfigSchema = union([
  literal(false),
  strictObject({
    path: optional(
      pipe(
        fileSchema,
        description(
          join(
            [
              "File of this tsconfig.",
              "@default `tsconfig.<environment>.json`, named after the environment that owns it",
            ],
            "\n",
          ),
        ),
      ),
    ),
    inherits: optional(
      pipe(
        picklist(tsconfigEnvironments),
        description(
          join(
            [
              "Environment whose tsconfig this one shares instead of having its own: its files and options apply here, so no other tsconfig option can be set alongside.",
              "@default none, except `scripts` for `tooling`",
            ],
            "\n",
          ),
        ),
      ),
    ),
    extends: optional(
      pipe(
        managedListOptionSchema(string()),
        description(
          join(
            [
              "Value of `extends`.",
              "`false` leaves the field to the file.",
              "@default the base tsconfig (the `tests` tsconfig for `tests.dist`)",
            ],
            "\n",
          ),
        ),
      ),
    ),
    include: optional(
      pipe(
        managedListOptionSchema(string()),
        description(
          join(
            [
              "Value of `include`.",
              "`false` leaves the field to the file.",
              "@default the TypeScript files of the environments that share this tsconfig, plus the env file when they define globals",
            ],
            "\n",
          ),
        ),
      ),
    ),
    exclude: optional(
      pipe(
        managedListOptionSchema(string()),
        description(
          join(
            [
              "Value of `exclude`.",
              "`false` leaves the field to the file.",
              "@default the test fixtures for a tsconfig that includes tests, nothing otherwise",
            ],
            "\n",
          ),
        ),
      ),
    ),
    lib: optional(
      pipe(
        managedListOptionSchema(string()),
        description(
          join(
            [
              "Value of `compilerOptions.lib`.",
              "Rejected for a baseline runtime, whose built-ins come from the baseline types.",
              "`false` leaves the field to the file.",
              "@default `ESNext` for a Node runtime",
            ],
            "\n",
          ),
        ),
      ),
    ),
    types: optional(
      pipe(
        managedListOptionSchema(string()),
        description(
          join(
            [
              "Value of `compilerOptions.types`.",
              "`false` leaves the field to the file.",
              "@default `node` for a Node runtime; for a baseline runtime, the baseline year entry then `@auaust/engrenage/apis/<group>` for each `src.apis` group",
            ],
            "\n",
          ),
        ),
      ),
    ),
    compilerOptions: optional(
      pipe(
        record(string(), unknown()),
        description(
          join(
            [
              "Options written into `compilerOptions` after the ones engrenage derives; it wins over them, `noLib` included.",
              "Unset, only the derived options are written.",
            ],
            "\n",
          ),
        ),
      ),
    ),
    // @debt the unmanaged description was written from reading the code and not verified by running it
    unmanaged: optional(
      pipe(
        listOptionSchema(string()),
        description(
          join(
            [
              "Dotted paths in this tsconfig (such as `compilerOptions.paths`) that sync never writes.",
              "@default none",
            ],
            "\n",
          ),
        ),
      ),
    ),
    check: optional(
      pipe(
        boolean(),
        description(
          join(
            [
              "Whether the base tsconfig references this tsconfig, so `engrenage typecheck` checks it.",
              "@default `true`, except for `tests.dist`",
            ],
            "\n",
          ),
        ),
      ),
    ),
  }),
]);
