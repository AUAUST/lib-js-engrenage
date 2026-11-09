import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { buildSchema } from "#project/build/config/schemas/buildSchema";
import type { ResolvedBuild } from "#project/build/types/ResolvedBuild";
import type { ConfigResolver } from "#project/config/index";

export const buildSection = declareSection({
  name: "build",
  declaration: buildSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedBuild> {
    const { entries } = buildSchema;

    const context = {
      define: await config.resolve("define"),
    };

    return freeze({
      configuredOutDir: input?.outDir,
      clean: entries.clean.resolve(input?.clean, context, "build.clean"),
      sourcemap: entries.sourcemap.resolve(
        input?.sourcemap,
        context,
        "build.sourcemap",
      ),
      typed: entries.typed.resolve(input?.typed, context, "build.typed"),
    });
  },
});
