import { listScopeConfigs } from "#project/workspaces/index";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedGenerator } from "#project/generators/types/ResolvedGenerator";

/**
 * The generators of every scope of the project, scope by scope, each in
 * declaration order.
 */
export async function listGenerators(
  config: ConfigResolver,
): Promise<readonly ResolvedGenerator[]> {
  const scopes = await listScopeConfigs(config);

  const generators = await Promise.all(
    scopes.map((scope) => scope.resolve("generators")),
  );

  return generators.flat();
}
