import { resolveTsconfigEnvironments } from "#project/tsconfig/operations/resolveTsconfigEnvironments";
import type { Runtime } from "#project/baseline/index";
import type { ProjectConfig } from "#project/config/index";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";

export function resolveTsconfigRuntime(
  config: ProjectConfig,
  key: TsconfigKey,
): Runtime | undefined {
  const { owner } = resolveTsconfigEnvironments(config, key);

  return config[owner].runtime;
}
