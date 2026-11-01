import { resolveTsconfigEnvironments } from "#typescript/utils/resolveTsconfigEnvironments";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Runtime } from "#config/types/Runtime";
import type { TsconfigKey } from "#config/types/TsconfigKey";

export function resolveTsconfigRuntime(
  config: ResolvedConfig,
  key: TsconfigKey,
): Runtime {
  const { owner } = resolveTsconfigEnvironments(config, key);

  const runtime = config[owner].runtime;

  if (runtime === undefined) {
    throw new Error(`The ${owner} environment has no runtime to target`);
  }

  return runtime;
}
