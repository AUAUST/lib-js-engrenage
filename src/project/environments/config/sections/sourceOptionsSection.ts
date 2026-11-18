import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { sourceSchema } from "#project/environments/config/schemas/sourceSchema";
import type { ConfigResolver } from "#project/config/index";

export const sourceOptionsSection = declareSection({
  declaration: sourceSchema,
  async resolve(input, config: ConfigResolver) {
    const options = sourceSchema.resolve(
      input,
      {
        tool() {
          return config.resolve("build.tool");
        },
        reporter: config.context.reporter,
      },
      "src",
    );

    // @debt the object declaration resolves its entries synchronously, so the section awaits the one entry whose default is async; declareObject could await its entries instead
    return freeze({ ...options, bundled: await options.bundled });
  },
});
