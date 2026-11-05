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

export function resolveGit(
  raw: RawConfig,
  context: ConfigContext,
): ResolvedGit {
  const { gitignore } = resolveSection(gitSchema, raw.git, context, "git");

  const projectRoot = context.get("root");
  const projectFilesystem = context.get("filesystem");

  const location = {
    root: projectRoot,
    filesystem: projectFilesystem,
  };

  const repositoryRoot = findRepositoryRoot(projectRoot);

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
