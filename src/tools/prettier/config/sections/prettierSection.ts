import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { locateFile, type ConfigResolver } from "#project/config/index";
import { prettierSchema } from "#tools/prettier/config/schemas/prettierSchema";
import type { ResolvedPrettier } from "#tools/prettier/types/ResolvedPrettier";

export const prettierSection = declareSection({
  name: "prettier",
  declaration: prettierSchema,
  resolve(input, config: ConfigResolver): ResolvedPrettier {
    const { root, filesystem } = config.context;

    const { prettierignore } = prettierSchema.resolve(
      input,
      config,
      "prettier",
    );

    return freeze(
      compose(
        {},
        compose.getters({
          prettierignore: () => {
            return locateFile(
              { root, filesystem },
              prettierignore.file,
              prettierignore.configured,
            );
          },
        }),
      ),
    );
  },
});
