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

async function holdsLanguageFile({
  config,
  scope,
  placements,
  instance: { environment, dirs, files },
}: {
  config: ConfigResolver;
  scope: ConfigResolver;
  placements: EnvironmentPlacements;
  instance: EnvironmentInstance;
}): Promise<boolean> {
  if (files.length > 0) {
    return true;
  }

  const [languages, git] = await Promise.all([
    readEnvironmentLanguages(scope, environment),
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
 * each with the tsconfig its scope's registration gives and the `file` sync
 * writes for it: its `path` resolved against the instance's scope.
 */
export async function listInstanceTsconfigs(config: ConfigResolver) {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const scoped = await Promise.all(
    environments.instances
      .filter(({ active }) => active)
      .map(async (instance) => {
        const scope = await config.context.scope(instance.scope);

        const registrations = await listTsconfigRegistrations(scope);

        const checked = (
          registrations.some(({ name }) => {
            return name === instance.environment;
          }) &&
          (await holdsLanguageFile({
            config,
            scope,
            placements: environments.placements,
            instance,
          }))
        );

        return checked ? [{ instance, scope }] : [];
      }),
  );

  return Promise.all(
    scoped.flat().map(async ({ instance, scope }) => {
      const tsconfig = await resolveEnvironmentTsconfig(
        scope,
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
