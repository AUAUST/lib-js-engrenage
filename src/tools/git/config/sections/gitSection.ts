import { toArray } from "@auaust/toolkit/array";
import { compose } from "@auaust/toolkit/composer";
import { concat, unique } from "@auaust/toolkit/iterable";
import { freeze } from "@auaust/toolkit/object";

import { createFilesystem } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { locateFile, type ConfigResolver } from "#project/config/index";
import { gitSchema } from "#tools/git/config/schemas/gitSchema";
import { findRepositoryRoot } from "#tools/git/operations/findRepositoryRoot";
import { listExcludeFiles } from "#tools/git/operations/listExcludeFiles";
import { listIgnoredGlobs } from "#tools/git/operations/listIgnoredGlobs";
import { listNestedIgnoreFiles } from "#tools/git/operations/listNestedIgnoreFiles";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";
import type { File } from "#types/File";

export const gitSection = declareSection({
  declaration: gitSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedGit> {
    const { root, filesystem } = config.context;

    const { gitignore, local } = gitSchema.resolve(input, config, "git");

    const repositoryRoot = await findRepositoryRoot(root);

    function locateGitignore(): Promise<File | undefined> {
      return locateFile(
        { root, filesystem },
        gitignore.file,
        gitignore.configured,
      );
    }

    // @debt composing here doesn't bring any value over writing the object directly
    return freeze(
      compose(
        {
          local,
          root: repositoryRoot,
          filesystem: repositoryRoot === root
            ? filesystem
            : createFilesystem(repositoryRoot),
        },
        compose.getters({
          gitignore: locateGitignore,
          ignored: () => listIgnoredGlobs(repositoryRoot, root),
          excludeFiles: () => listExcludeFiles(repositoryRoot),
          ignoreFiles: async () => {
            const [rootFile, nested] = await Promise.all([
              locateGitignore(),
              listNestedIgnoreFiles(repositoryRoot, root),
            ]);

            return toArray(
              unique(concat(rootFile === undefined ? [] : [rootFile], nested)),
            );
          },
        }),
      ),
    );
  },
});
