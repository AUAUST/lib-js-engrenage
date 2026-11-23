import { getEnvironmentCoverage } from "#batiment/environments/index";
import { filesIn } from "#foundation/filesystem/index";
import { readEnvironmentLanguages } from "#project/environments/operations/readEnvironmentLanguages";
import { listLanguageFiles } from "#project/environments/utils/listLanguageFiles";
import type { ConfigResolver } from "#project/config/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

async function listEnvironmentFiles(
  config: ConfigResolver,
  environment: string | undefined,
  dir: Directory,
): Promise<Globs> {
  if (environment === undefined) {
    return [];
  }

  const languages = await readEnvironmentLanguages(config, environment);

  return filesIn([dir], listLanguageFiles(languages));
}

/**
 * Lists the globs of the language files under `dirs`, each directory's from the
 * environment placed at or above it, and each directory placement nested below
 * it from its own environment.
 */
export async function listPlacementGlobs(
  config: ConfigResolver,
  dirs: Directories,
): Promise<Globs> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const globs = await Promise.all(
    dirs.map(async (dir) => {
      const {
        environment,
        nested,
      } = getEnvironmentCoverage(environments.placements, dir);

      // @debt a nested placement's files stay in the enclosing directory's globs too, since excluding them is #868's
      const listed = await Promise.all([
        listEnvironmentFiles(config, environment, dir),
        ...nested.map((placement) => {
          return listEnvironmentFiles(
            config,
            placement.environment,
            placement.dir,
          );
        }),
      ]);

      return listed.flat();
    }),
  );

  return globs.flat();
}
