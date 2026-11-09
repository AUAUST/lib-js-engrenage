import { formatWithPrettier } from "#tools/prettier/adapters/formatWithPrettier";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";

export async function formatChanges({
  resolve,
  context,
}: LoadedConfig): Promise<Filesystem[]> {
  const git = await resolve("git");

  const filesystems = [...new Set([context.filesystem, git.filesystem])];

  await Promise.all(
    filesystems.map((filesystem) => {
      return filesystem.format((path, content) => {
        // @debt the git filesystem may sit above the project root, yet its files are formatted with the project's Prettier and ignore file
        return formatWithPrettier(content, {
          path,
          root: context.root,
        });
      });
    }),
  );

  return filesystems;
}
