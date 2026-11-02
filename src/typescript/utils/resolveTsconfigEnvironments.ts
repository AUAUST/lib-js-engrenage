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
  // @debt mapping tests.dist to tests makes every producer re-emit include, exclude, target, lib and types into tsconfig.tests.dist.json although it already inherits them from tsconfig.tests.json; the plan (#37) lists only paths, skipLibCheck and tsBuildInfoFile for the variant
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
