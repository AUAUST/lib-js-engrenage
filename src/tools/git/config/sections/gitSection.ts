import { deduplicate, map } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { gitignoreFile } from "#constants";
import { createFilesystem, resolveWithin } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { locateFile, type ConfigResolver } from "#project/config/index";
import { gitSchema } from "#tools/git/config/schemas/gitSchema";
import { findRepositoryRoot } from "#tools/git/operations/findRepositoryRoot";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";
import type { File } from "#types/File";
import type { Files } from "#types/Files";

// @debt globs the whole tree on every load, git-ignored directories included, while Git only reads ignore files outside ignored directories; asking Git (`git ls-files`) would list exactly those
async function listNestedIgnoreFiles(config: ConfigResolver): Promise<Files> {
  const { root, filesystem } = config.context;

  const cache = await config.resolve("cache");

  const files = await filesystem.glob(
    [`*/**/${gitignoreFile}`, `**/.*/**/${gitignoreFile}`],
    {
      exclude: [".git", "**/node_modules", cache.dir],
    },
  );

  return map(files, (file) => {
    return resolveWithin(root, file);
  });
}

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
          filesystem:
            repositoryRoot === root
              ? filesystem
              : createFilesystem(repositoryRoot),
        },
        compose.getters({
          gitignore: locateGitignore,
          ignoreFiles: async () => {
            const [rootFile, nested] = await Promise.all([
              locateGitignore(),
              listNestedIgnoreFiles(config),
            ]);

            return deduplicate([
              ...(rootFile === undefined ? [] : [rootFile]),
              ...nested,
            ]);
          },
        }),
      ),
    );
  },
});
