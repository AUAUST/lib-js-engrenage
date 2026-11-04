import { resolveTsconfigEnvironments } from "#project/tsconfig/operations/resolveTsconfigEnvironments";
import type { Runtime } from "#project/baseline/types/Runtime";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";

export function resolveTsconfigRuntime(
  config: ProjectConfig,
  key: TsconfigKey,
): Runtime | undefined {
  const { owner } = resolveTsconfigEnvironments(config, key);

  return config[owner].runtime;
}
