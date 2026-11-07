import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import { buildSchema } from "#project/build/config/schemas/buildSchema";
import { defineSection } from "#project/environments/index";
import type { ResolvedBuild } from "#project/build/types/ResolvedBuild";
import type { ConfigContext } from "#project/config/index";

export const buildSection = declareSection({
  name: "build",
  declaration: buildSchema,
  async resolve(
    input,
    config: Resolver<ConfigContext>,
  ): Promise<ResolvedBuild> {
    const { entries } = buildSchema;

    const context = {
      define: await config.resolve(defineSection),
    };

    return freeze({
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
