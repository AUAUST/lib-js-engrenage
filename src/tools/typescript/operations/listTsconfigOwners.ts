import { listTsconfigEnvironments } from "#tools/typescript/operations/listTsconfigEnvironments";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import type { ConfigResolver } from "#project/config/index";

export async function listTsconfigOwners(
  config: ConfigResolver,
): Promise<readonly string[]> {
  const owners = new Set<string>();

  for (const name of await listTsconfigEnvironments(config)) {
    const { tsconfig } = await resolveTsconfigEnvironment(config, name);

    if (tsconfig.owner !== undefined) {
      owners.add(tsconfig.owner);
    }
  }

  return [...owners];
}
