import {
  listForeignPlacementGlobs,
  type EnvironmentInstance,
  type EnvironmentPlacements,
} from "#batiment/environments/index";
import { filesIn } from "#foundation/filesystem/index";
import type { ConfigResolver } from "#project/config/index";
import type { Globs } from "#types/Globs";

/**
 * Whether a file Git does not ignore matches `files` in the directories of
 * `instance`, outside the placements of other environments nested in them.
 */
export async function holdsInstanceFile({
  config,
  placements,
  instance: { dirs },
  files,
}: {
  config: ConfigResolver;
  placements: EnvironmentPlacements;
  instance: EnvironmentInstance;
  files: Globs;
}): Promise<boolean> {
  const git = await config.resolve("git");

  // @debt globs every matching file of the instance where the first match would answer, as the filesystem's early-stopping `hasFile` filters by skipped globs only
  const matched = await config.context.filesystem.glob(filesIn(dirs, files), {
    exclude: [
      ...(await git.ignored),
      ...dirs.flatMap((dir) => listForeignPlacementGlobs(placements, dir)),
    ],
  });

  return matched.length > 0;
}
