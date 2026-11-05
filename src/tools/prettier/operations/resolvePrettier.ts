import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { resolveSection } from "#foundation/options/index";
import {
  locateFile,
  type ConfigContext,
  type RawConfig,
} from "#project/config/index";
import { prettierSchema } from "#tools/prettier/config/schemas/prettierSchema";
import type { ResolvedPrettier } from "#tools/prettier/types/ResolvedPrettier";

export function resolvePrettier(
  raw: RawConfig,
  context: ConfigContext,
): ResolvedPrettier {
  const { prettierignore } = resolveSection(
    prettierSchema,
    raw.prettier,
    context,
    "prettier",
  );

  const location = {
    root: context.get("root"),
    filesystem: context.get("filesystem"),
  };

  return freeze(
    compose(
      {},
      compose.getters({
        prettierignore: () => {
          return locateFile(
            location,
            prettierignore.file,
            prettierignore.configured,
          );
        },
      }),
    ),
  );
}
