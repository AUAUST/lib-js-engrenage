import { deduplicate } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#foundation/options/index";
import { readIgnorePatterns } from "#tools/git/index";
import { issueDraftsDirectory } from "#tools/github/index";
import type { LoadedConfig } from "#project/config/index";
import type { Globs } from "#types/Globs";

export async function listLocalFilePatterns(
  config: LoadedConfig,
): Promise<Globs> {
  const git = await config.resolve("git");

  const file = await git.gitignore;

  const ignored = git.local.gitignore && file !== undefined
    ? await readIgnorePatterns(config.context.filesystem, file)
    : [];

  return resolveListOption(
    git.local.files,
    () => deduplicate([...ignored, issueDraftsDirectory]),
    "git.local.files",
  );
}
