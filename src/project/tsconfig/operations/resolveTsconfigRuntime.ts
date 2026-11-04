import { resolveTsconfigEnvironments } from "#tsconfig/operations/resolveTsconfigEnvironments";
import type { Runtime } from "#baseline/types/Runtime";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TsconfigKey } from "#tsconfig/types/TsconfigKey";

export function resolveTsconfigRuntime(
  config: ResolvedConfig,
  key: TsconfigKey,
): Runtime | undefined {
  const { owner } = resolveTsconfigEnvironments(config, key);

  return config[owner].runtime;
}
