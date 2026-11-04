import { resolveTsconfigEnvironments } from "#project/tsconfig/operations/resolveTsconfigEnvironments";
import type { Runtime } from "#project/baseline/types/Runtime";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";

export function resolveTsconfigRuntime(
  config: ResolvedConfig,
  key: TsconfigKey,
): Runtime | undefined {
  const { owner } = resolveTsconfigEnvironments(config, key);

  return config[owner].runtime;
}
