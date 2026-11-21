import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { staticSchema } from "#project/environments/config/schemas/staticSchema";
import { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedStatic } from "#project/environments/types/ResolvedStatic";

export const staticSection = declareSection({
  declaration: staticSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedStatic> {
    const option = staticSchema.resolve(
      input,
      {
        traits: await config.resolve("traits"),
        reporter: config.context.reporter,
      },
      "static",
    );

    const {
      dirs,
      active,
    } = await discoverDeclaredEnvironment(config, "static", {
      dirs: option.dirs,
      files: [],
    });

    return freeze({
      active,
      dirs,
    });
  },
});
