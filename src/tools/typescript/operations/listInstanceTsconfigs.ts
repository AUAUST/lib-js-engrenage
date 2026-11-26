import { posix } from "node:path";

import {
  listLanguageFiles,
  readEnvironmentLanguages,
  resolveEnvironmentTsconfig,
} from "#project/environments/index";
import { holdsInstanceFile } from "#tools/typescript/operations/holdsInstanceFile";
import { listActiveInstances } from "#tools/typescript/operations/listActiveInstances";
import type {
  EnvironmentInstance,
  EnvironmentPlacements,
} from "#batiment/environments/index";
import type { ConfigResolver } from "#project/config/index";

async function holdsLanguageFile({
  config,
  scope,
  placements,
  instance,
}: {
  config: ConfigResolver;
  scope: ConfigResolver;
  placements: EnvironmentPlacements;
  instance: EnvironmentInstance;
}): Promise<boolean> {
  if (instance.files.length > 0) {
    return true;
  }

  const languages = await readEnvironmentLanguages(scope, instance.environment);

  return holdsInstanceFile({
    config,
    placements,
    instance,
    files: listLanguageFiles(languages),
  });
}

/**
 * Lists the active instances, in every scope, of the environments whose preset
 * has a tsconfig, holding a file in their languages for the tsconfig to check,
 * each with the tsconfig its scope's registration gives and the `file` sync
 * writes for it: its `path` resolved against the instance's scope.
 */
export async function listInstanceTsconfigs(config: ConfigResolver) {
  const { placements, instances } = await listActiveInstances(config);

  const scoped = await Promise.all(
    instances.map(async ({ instance, scope, tsconfig }) => {
      const checked = (
        tsconfig &&
        (await holdsLanguageFile({
          config,
          scope,
          placements,
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
