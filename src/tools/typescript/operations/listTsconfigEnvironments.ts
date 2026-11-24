import { rootScope } from "#batiment/scopes/constants";
import { listTsconfigRegistrations } from "#project/environments/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Lists the environments with an active instance in the root scope whose preset
 * has a tsconfig, each getting one root tsconfig.
 */
export async function listTsconfigEnvironments(
  config: ConfigResolver,
): Promise<readonly string[]> {
  const [registrations, context] = await Promise.all([
    listTsconfigRegistrations(config),
    config.resolve("structure.context"),
  ]);

  const { environments } = await context.discover();

  const names = new Set(registrations.map(({ name }) => name));

  return environments.instances
    .filter(({ environment, scope, active }) => {
      return active && scope === rootScope && names.has(environment);
    })
    .map(({ environment }) => environment);
}
