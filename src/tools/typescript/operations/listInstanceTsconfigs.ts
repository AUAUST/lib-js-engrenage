import { posix } from "node:path";

import {
  listForeignPlacementGlobs,
  type EnvironmentInstance,
  type EnvironmentPlacements,
} from "#batiment/environments/index";
import { filesIn } from "#foundation/filesystem/index";
import {
  listLanguageFiles,
  listTsconfigRegistrations,
  readEnvironmentLanguages,
  resolveEnvironmentTsconfig,
} from "#project/environments/index";
import type { ConfigResolver } from "#project/config/index";

async function holdsLanguageFile(
  config: ConfigResolver,
  placements: EnvironmentPlacements,
  { environment, dirs, files }: EnvironmentInstance,
): Promise<boolean> {
  if (files.length > 0) {
    return true;
  }

  const [languages, git] = await Promise.all([
    readEnvironmentLanguages(config, environment),
    config.resolve("git"),
  ]);

  // @debt globs every language file of the instance where the first match would answer, as the filesystem's early-stopping `hasFile` filters by skipped globs only
  const matched = await config.context.filesystem.glob(
    filesIn(dirs, listLanguageFiles(languages)),
    {
      exclude: [
        ...(await git.ignored),
        ...dirs.flatMap((dir) => listForeignPlacementGlobs(placements, dir)),
      ],
    },
  );

  return matched.length > 0;
}

/**
 * Lists the active instances, in every scope, of the environments whose preset
 * has a tsconfig, holding a file in their languages for the tsconfig to check,
 * each with its registration's tsconfig and the `file` sync writes for it: its
 * `path` resolved against the instance's scope.
 */
export async function listInstanceTsconfigs(config: ConfigResolver) {
  const [registrations, context] = await Promise.all([
    listTsconfigRegistrations(config),
    config.resolve("structure.context"),
  ]);

  const { environments } = await context.discover();

  const names = new Set(registrations.map(({ name }) => name));

  const candidates = environments.instances.filter(
    ({ environment, active }) => {
      return active && names.has(environment);
    },
  );

  const checked = await Promise.all(
    candidates.map((instance) => {
      return holdsLanguageFile(config, environments.placements, instance);
    }),
  );

  const instances = candidates.filter((_, index) => checked[index]);

  return Promise.all(
    instances.map(async (instance) => {
      const tsconfig = await resolveEnvironmentTsconfig(
        config,
        instance.environment,
      );

      return {
        instance,
        tsconfig,
        file: tsconfig.file === undefined
          ? undefined
          : posix.join(instance.scope, tsconfig.file),
      };
    }),
  );
}
