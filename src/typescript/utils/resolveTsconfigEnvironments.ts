import { tsconfigEnvironments } from "#config/constants";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TsconfigKey } from "#config/types/TsconfigKey";

type TsconfigEnvironment = (typeof tsconfigEnvironments)[number];

export function resolveTsconfigEnvironments(
  config: ResolvedConfig,
  key: TsconfigKey,
): {
  owner: TsconfigEnvironment;
  environments: readonly TsconfigEnvironment[];
} {
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
