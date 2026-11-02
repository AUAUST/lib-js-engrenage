import { resolveTsconfigEnvironments } from "#typescript/utils/resolveTsconfigEnvironments";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Runtime } from "#config/types/Runtime";
import type { TsconfigKey } from "#config/types/TsconfigKey";

export function resolveTsconfigRuntime(
  config: ResolvedConfig,
  key: TsconfigKey,
): Runtime | undefined {
  const { owner } = resolveTsconfigEnvironments(config, key);

  return config[owner].runtime;
}
