import { listTsconfigEnvironments } from "#tools/typescript/operations/listTsconfigEnvironments";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigKey } from "#project/tsconfig/index";

export async function resolveTsconfigEnvironments(
  config: LoadedConfig,
  key: TsconfigKey,
): Promise<{
  owner: string;
  environments: readonly string[];
}> {
  // @debt producers compute tests.dist fields as if it were tests, and syncTsconfigFiles then drops the ones it inherits; knowing which fields a variant inherits here would let producers skip them directly
  const owner = key === "tests.dist" ? "tests" : key;

  const inheritors: string[] = [];

  for (const name of await listTsconfigEnvironments(config)) {
    const { active, tsconfig } = await resolveTsconfigEnvironment(config, name);

    if (name !== owner && active && tsconfig.owner === owner) {
      inheritors.push(name);
    }
  }

  return { owner, environments: [owner, ...inheritors] };
}
