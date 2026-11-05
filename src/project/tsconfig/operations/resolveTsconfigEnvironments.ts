import { tsconfigEnvironments } from "#project/tsconfig/constants";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";

type TsconfigEnvironment = (typeof tsconfigEnvironments)[number];

export async function resolveTsconfigEnvironments(
  config: ConfigContext,
  key: TsconfigKey,
): Promise<{
  owner: TsconfigEnvironment;
  environments: readonly TsconfigEnvironment[];
}> {
  // @debt producers compute tests.dist fields as if it were tests, and syncTsconfigFiles then drops the ones it inherits; knowing which fields a variant inherits here would let producers skip them directly
  const owner = key === "tests.dist" ? "tests" : key;

  const inheritors: TsconfigEnvironment[] = [];

  for (const name of tsconfigEnvironments) {
    const { active, tsconfig } = await config.get(name);

    if (name !== owner && active && tsconfig.owner === owner) {
      inheritors.push(name);
    }
  }

  return { owner, environments: [owner, ...inheritors] };
}
