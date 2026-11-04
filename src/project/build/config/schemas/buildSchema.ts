import { boolean, literal, picklist, union } from "valibot";

import { isWithin } from "#foundation/filesystem/utils/isWithin";
import { resolveWithin } from "#foundation/filesystem/utils/resolveWithin";
import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { directorySchema } from "#project/config/config/schemas/values/directorySchema";
import { defaultBuildClean, defaultSourcemap } from "#project/config/constants";
import type { ConfigContext } from "#project/config/types/ConfigContext";

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
    clean: declare(union([picklist(["all", "emitted"]), literal(false)]), {
      description: [
        'What a build removes from the output directory first: `"all"` empties it, `"emitted"` removes only the files the previous build emitted (for an output directory shared with a host), `false` removes nothing.',
        "The emitted files are recorded in a manifest in the cache directory, written after a successful build.",
      ],
      optional: { value: defaultBuildClean },
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
