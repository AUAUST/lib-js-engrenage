import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { createFilesystem } from "#foundation/filesystem/index";
import { resolveSection } from "#foundation/options/index";
import {
  locateFile,
  type ConfigContext,
  type RawConfig,
} from "#project/config/index";
import { gitSchema } from "#tools/git/config/schemas/gitSchema";
import { findRepositoryRoot } from "#tools/git/operations/findRepositoryRoot";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";

export async function resolveGit(
  raw: RawConfig,
  context: ConfigContext,
): Promise<ResolvedGit> {
  const { gitignore } = resolveSection(gitSchema, raw.git, context, "git");

  const projectRoot = await context.get("root");
  const projectFilesystem = await context.get("filesystem");

  const location = {
    root: projectRoot,
    filesystem: projectFilesystem,
  };

  const repositoryRoot = await findRepositoryRoot(projectRoot);

  return freeze(
    compose(
      {
        root: repositoryRoot,
        filesystem:
          repositoryRoot === projectRoot
            ? projectFilesystem
            : createFilesystem(repositoryRoot),
      },
      compose.getters({
        gitignore: () => {
          return locateFile(location, gitignore.file, gitignore.configured);
        },
      }),
    ),
  );
}
