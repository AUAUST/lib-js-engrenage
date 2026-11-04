import { boolean, custom, union } from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";

import { declare, declareObject, validate } from "#foundation/options/index";
import { globalsSchema } from "#project/config/config/schemas/globalsSchema";
import { defaultDefineTypes } from "#project/config/constants";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { GlobalsFactory } from "#project/config/types/GlobalsFactory";

export const defineSchema = declareObject(
  {
    types: declare(boolean(), {
      description:
        "Whether sync declares the `define.values` globals in the env file (`typescript.envFile`) and `build.typed` follows.",
      optional: { value: defaultDefineTypes },
    }),
    values: declare(
      union([globalsSchema, custom<GlobalsFactory>(isFunction)]),
      {
        description: [
          "Compile-time globals, by identifier or dotted path (such as `import.meta.env.NAME`) with a JSON-serializable value, optionally wrapped by `define()` for a type, scope and documentation.",
          "A function receives the `package.json` and the filesystem and returns them.",
          "They feed the `define` option of tsdown and Vite (hence Vitest) according to their scope, and the env file declarations.",
        ],
        optional: {
          value: {},
        },
        adjust(input, _fallback, context: ConfigContext) {
          if (!isFunction(input)) {
            return input;
          }

          const configFile = context.get("configFile");

          return validate(
            globalsSchema,
            input({
              packageJson: context.get("packageJson"),
              filesystem: context.get("filesystem"),
            }),
            `define.values of ${configFile ?? context.get("root")}`,
          );
        },
      },
    ),
  },
  {
    optional: true,
  },
);
