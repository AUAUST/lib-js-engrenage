import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { resolveSection } from "#foundation/options/utils/resolveSection";
import { locateFile } from "#project/config/utils/locateFile";
import { prettierSchema } from "#tools/prettier/config/schemas/prettierSchema";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { RawConfig } from "#project/config/types/RawConfig";
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
