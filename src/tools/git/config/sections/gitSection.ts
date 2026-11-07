import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { createFilesystem } from "#foundation/filesystem/index";
import { declareSection, type Resolver } from "#foundation/options/index";
import { locateFile, type ConfigContext } from "#project/config/index";
import { gitSchema } from "#tools/git/config/schemas/gitSchema";
import { findRepositoryRoot } from "#tools/git/operations/findRepositoryRoot";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";

export const gitSection = declareSection({
  name: "git",
  declaration: gitSchema,
  async resolve(input, config: Resolver<ConfigContext>): Promise<ResolvedGit> {
    const { root, filesystem } = config.context;

    const { gitignore } = gitSchema.resolve(input, config, "git");

    const repositoryRoot = await findRepositoryRoot(root);

    // @debt composing here doesn't bring any value over writing the object directly
    return freeze(
      compose(
        {
          root: repositoryRoot,
          filesystem:
            repositoryRoot === root
              ? filesystem
              : createFilesystem(repositoryRoot),
        },
        compose.getters({
          gitignore: () => {
            return locateFile(
              { root, filesystem },
              gitignore.file,
              gitignore.configured,
            );
          },
        }),
      ),
    );
  },
});
