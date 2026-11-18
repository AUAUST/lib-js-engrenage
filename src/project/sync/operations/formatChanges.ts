import { loadFormatter } from "#project/format/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";

export async function formatChanges(
  config: LoadedConfig,
): Promise<Filesystem[]> {
  const { resolve, context } = config;

  const git = await resolve("git");

  const filesystems = [...new Set([context.filesystem, git.filesystem])];

  const formatter = await loadFormatter(config);

  if (formatter === undefined) {
    return filesystems;
  }

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
