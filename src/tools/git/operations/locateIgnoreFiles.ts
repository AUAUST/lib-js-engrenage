import { relativeWithin } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { IgnoreFileEntry } from "#tools/git/ports/IgnoreFileEntry";
import type { File } from "#types/File";

/**
 * Each `ignore.files` contribution whose resource is located, with that resource's
 * path relative to the root.
 */
export async function locateIgnoreFiles(
  config: LoadedConfig,
): Promise<readonly { entry: IgnoreFileEntry; file: File }[]> {
  const [root, resources, contributions] = await Promise.all([
    config.context.root,
    config.resolve("resources"),
    config.context.registry.contributions("ignore.files", config),
  ]);

  return contributions
    .filter(({ entry }) => resources.get(entry.name) !== undefined)
    .map(({ entry }) => {
      return {
        entry,
        file: relativeWithin(root, resources.path(entry.name)),
      };
    });
}
