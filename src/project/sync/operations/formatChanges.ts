import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";

export async function formatChanges(
  config: LoadedConfig,
): Promise<Filesystem[]> {
  const { resolve, context } = config;

  const git = await resolve("git");

  const filesystems = [...new Set([context.filesystem, git.filesystem])];

  const selected = await resolve("format.formatter");

  if (selected === false) {
    return filesystems;
  }

  const formatter = await selected.load();

  await Promise.all(
    filesystems.map((filesystem) => {
      return filesystem.format((path, content) => {
        // @debt the git filesystem may sit above the project root, yet its files are formatted with the project's formatter and its ignore file
        return formatter(content, {
          path,
          config,
        });
      });
    }),
  );

  return filesystems;
}
