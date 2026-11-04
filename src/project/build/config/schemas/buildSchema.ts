import { boolean } from "valibot";

import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { defaultEmptyOutDir, defaultSourcemap } from "#config/constants";
import { isWithin } from "#filesystem/utils/isWithin";
import { resolveWithin } from "#filesystem/utils/resolveWithin";
import { declare } from "#options/utils/declare";
import { declareObject } from "#options/utils/declareObject";
import type { ConfigContext } from "#config/types/ConfigContext";

export const buildSchema = declareObject(
  {
    outDir: declare(directorySchema, {
      description:
        "Output directory of tsdown and Vite, ignored by Git and ESLint and listed in the published `files` of `package.json`.",
      optional: {
        explain:
          "`compilerOptions.outDir` of the base tsconfig; building fails when neither is set",
        compute(context: ConfigContext) {
          const outDir = context.get("tsconfig").optional.outDir;

          return outDir === undefined || !isWithin(context.get("root"), outDir)
            ? undefined
            : outDir;
        },
      },
      adjust(input, _fallback, context: ConfigContext) {
        // @debt resolveWithin is called only for its throw when the path escapes the root, here and in cache(); an explicit assertion would state the intent
        resolveWithin(context.get("root"), input);

        return input;
      },
    }),
    emptyOutDir: declare(boolean(), {
      description:
        "Whether a build empties the output directory first (the `clean` option of tsdown).",
      optional: { value: defaultEmptyOutDir },
    }),
    sourcemap: declare(boolean(), {
      description:
        "Whether builds emit source maps and the source directories are published with them.",
      optional: { value: defaultSourcemap },
    }),
    typed: declare(boolean(), {
      description: "Whether tsdown emits declaration files.",
      optional: {
        explain: "`define.types`",
        compute(context: ConfigContext) {
          return context.get("define").types;
        },
      },
    }),
  },
  {
    optional: true,
  },
);
