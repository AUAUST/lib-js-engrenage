import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { resolveSection } from "#foundation/options/utils/resolveSection";
import { locateFile } from "#project/config/utils/locateFile";
import { gitSchema } from "#tools/git/config/schemas/gitSchema";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";

export function resolveGit(
  raw: RawConfig,
  context: ConfigContext,
): ResolvedGit {
  const { gitignore } = resolveSection(gitSchema, raw.git, context, "git");

  const location = {
    root: context.get("root"),
    filesystem: context.get("filesystem"),
  };

  return freeze(
    compose(
      {},
      compose.getters({
        gitignore: () => {
          return locateFile(location, gitignore.file, gitignore.configured);
        },
      }),
    ),
  );
}
