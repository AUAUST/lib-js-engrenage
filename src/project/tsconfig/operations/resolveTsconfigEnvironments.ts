import { tsconfigEnvironments } from "#project/tsconfig/constants";
import type { ProjectConfig } from "#project/config/index";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";

type TsconfigEnvironment = (typeof tsconfigEnvironments)[number];

export function resolveTsconfigEnvironments(
  config: ProjectConfig,
  key: TsconfigKey,
): {
  owner: TsconfigEnvironment;
  environments: readonly TsconfigEnvironment[];
} {
  // @debt producers compute tests.dist fields as if it were tests, and syncTsconfigFiles then drops the ones it inherits; knowing which fields a variant inherits here would let producers skip them directly
  const owner = key === "tests.dist" ? "tests" : key;

  const inheritors = tsconfigEnvironments.filter((name) => {
    return (
      name !== owner &&
      config[name].active &&
      config[name].tsconfig.owner === owner
    );
  });

  return { owner, environments: [owner, ...inheritors] };
}
