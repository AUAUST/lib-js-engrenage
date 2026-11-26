import { listTsconfigRegistrations } from "#project/environments/index";
import type {
  EnvironmentInstance,
  EnvironmentPlacements,
} from "#batiment/environments/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Lists the active environment instances in every scope, each with its scope's
 * config and whether its registration there has a tsconfig, beside the placements
 * of every environment.
 */
export async function listActiveInstances(config: ConfigResolver): Promise<{
  placements: EnvironmentPlacements;
  instances: readonly {
    instance: EnvironmentInstance;
    scope: ConfigResolver;
    tsconfig: boolean;
  }[];
}> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const instances = await Promise.all(
    environments.instances
      .filter(({ active }) => active)
      .map(async (instance) => {
        const scope = await config.context.scope(instance.scope);

        const registrations = await listTsconfigRegistrations(scope);

        return {
          instance,
          scope,
          tsconfig: registrations.some(({ name }) => {
            return name === instance.environment;
          }),
        };
      }),
  );

  return {
    placements: environments.placements,
    instances,
  };
}
