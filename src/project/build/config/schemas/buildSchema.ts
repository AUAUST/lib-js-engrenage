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
import type { BuildTool } from "#project/build/ports/BuildTool";
import type { ResolvedDefine } from "#project/environments/index";
import type { ResolvedTraits } from "#project/presets/index";
import type { Tsconfig } from "#project/tsconfig/index";
import type { Directory } from "#types/Directory";

interface OutDirContext {
  readonly root: Directory;
  tsconfig(): Promise<Tsconfig>;
  tool(): Promise<BuildTool | false>;
}

export const buildSchema = declareObject(
  {
    tool: declare(buildToolNameSchema, {
      description: [
        "Build tool of the project, among those its extensions contribute (`tsdown` and `vite` when installed).",
        "`false` selects none.",
      ],
      optional: unset(
        "the active build tool the preset prefers, else the only active one; none when no build tool is active; resolving it fails when several are and the preset prefers none of them",
      ),
      disable: { value: false },
    }),
    outDir: declare(directorySchema, {
      description: "Output directory of tsdown and Vite, ignored by Git and ESLint and listed in the published `files` of `package.json`.",
      optional: {
        explain: "`compilerOptions.outDir` of the base tsconfig, else the output directory of the selected build tool; building fails when none is set",
        async compute(context: OutDirContext) {
          const { optional } = await context.tsconfig();

          const { outDir } = optional;

          if (outDir !== undefined && isWithin(context.root, outDir)) {
            return outDir;
          }

          const tool = await context.tool();

          return tool === false ? undefined : tool.outDir;
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
    minify: declare(union([boolean(), literal("keepNames")]), {
      description: 'Minification of tsdown and Vite builds, the same locally and in CI: `false` disables it, `"keepNames"` minifies and mangles but keeps function and class names, `true` minifies and mangles entirely.',
      optional: {
        explain: '`"keepNames"` when the project is `published`, `true` otherwise',
        compute(context: { traits: ResolvedTraits }) {
          return context.traits.published ? "keepNames" : true;
        },
      },
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
    sourceExports: declare(boolean(), {
      description: [
        "Whether tsdown adds a `source` export condition resolving each entry to its source file, for tools that load the package from its sources.",
        "The published manifest keeps only the built files, through `publishConfig.exports`, which pnpm honors and npm ignores.",
      ],
      optional: { value: false },
    }),
  },
  {
    optional: true,
  },
);
