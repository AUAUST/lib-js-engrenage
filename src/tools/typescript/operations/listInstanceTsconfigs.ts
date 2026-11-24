import { posix } from "node:path";

import {
  listTsconfigRegistrations,
  resolveEnvironmentTsconfig,
} from "#project/environments/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Lists the active instances, in every scope, of the environments whose preset
 * has a tsconfig, each with its registration's tsconfig and the `file` sync
 * writes for it: its `path` resolved against the instance's scope.
 */
export async function listInstanceTsconfigs(config: ConfigResolver) {
  const [registrations, context] = await Promise.all([
    listTsconfigRegistrations(config),
    config.resolve("structure.context"),
  ]);

  const { environments } = await context.discover();

  const names = new Set(registrations.map(({ name }) => name));

  const instances = environments.instances.filter(({ environment, active }) => {
    return active && names.has(environment);
  });

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
