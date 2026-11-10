import { boolean, literal, picklist, union } from "valibot";

import { isWithin, resolveWithin } from "#foundation/filesystem/index";
import {
  declare,
  declareObject,
  directorySchema,
  unset,
} from "#foundation/options/index";
import { buildToolNameSchema } from "#project/build/config/schemas/buildToolNameSchema";
import { defaultBuildClean, defaultSourcemap } from "#project/build/constants";
import type { ResolvedDefine } from "#project/environments/index";
import type { Tsconfig } from "#project/tsconfig/index";
import type { Directory } from "#types/Directory";

interface OutDirContext {
  readonly root: Directory;
  tsconfig(): Promise<Tsconfig>;
}

export const buildSchema = declareObject(
  {
    tool: declare(buildToolNameSchema, {
      description: [
        "Build tool of the project, among those its extensions contribute (`tsdown` and `vite` when installed).",
        "`false` selects none.",
      ],
      optional: unset(
        "the only active build tool, none when no build tool is active; resolving it fails when several are",
      ),
      disable: { value: false },
    }),
    outDir: declare(directorySchema, {
      description: "Output directory of tsdown and Vite, ignored by Git and ESLint and listed in the published `files` of `package.json`.",
      optional: {
        explain: "`compilerOptions.outDir` of the base tsconfig; building fails when neither is set",
        async compute(context: OutDirContext) {
          const { optional } = await context.tsconfig();

          const { outDir } = optional;

          return outDir === undefined || !isWithin(context.root, outDir)
            ? undefined
            : outDir;
        },
      },
      adjust(input, _fallback, context: OutDirContext) {
        // @debt resolveWithin is called only for its throw when the path escapes the root, here and in cache(); an explicit assertion would state the intent
        resolveWithin(context.root, input);

        return Promise.resolve(input);
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
      description: "Whether builds emit source maps and the source directories are published with them.",
      optional: { value: defaultSourcemap },
    }),
    typed: declare(boolean(), {
      description: "Whether tsdown emits declaration files.",
      optional: {
        explain: "`define.types`",
        compute(context: { define: ResolvedDefine }) {
          return context.define.types;
        },
      },
    }),
  },
  {
    optional: true,
  },
);
