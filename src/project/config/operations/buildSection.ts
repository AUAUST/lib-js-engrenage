import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import { buildSchema } from "#project/build/index";
import { defineSection } from "#project/config/operations/defineSection";
import { tsconfigSection } from "#project/config/operations/tsconfigSection";
import type { ConfigContext } from "#project/config/types/ConfigContext";

export const buildSection = declareSection({
  name: "build",
  declaration: buildSchema,
  async resolve(input, config: Resolver<ConfigContext>) {
    const { entries } = buildSchema;

    const context = {
      root: config.context.root,
      tsconfig: () => config.resolve(tsconfigSection),
      define: await config.resolve(defineSection),
    };

    function resolveOutDir() {
      return entries.outDir.resolve(input?.outDir, context, "build.outDir");
    }

    // @debt build.outDir is resolved on access because its computed default reads the tsconfig, which can fail to parse, while declarations otherwise resolve a section as a whole
    return freeze(
      compose(
        {
          clean: entries.clean.resolve(input?.clean, context, "build.clean"),
          sourcemap: entries.sourcemap.resolve(
            input?.sourcemap,
            context,
            "build.sourcemap",
          ),
          typed: entries.typed.resolve(input?.typed, context, "build.typed"),
        },
        compose.getters({
          outDir: resolveOutDir,
        }),
      ),
    );
  },
});
