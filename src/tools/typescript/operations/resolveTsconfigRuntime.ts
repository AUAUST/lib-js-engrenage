import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import { resolveTsconfigEnvironments } from "#tools/typescript/operations/resolveTsconfigEnvironments";
import type { Runtime } from "#project/baseline/index";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigKey } from "#project/tsconfig/index";

export async function resolveTsconfigRuntime(
  config: LoadedConfig,
  key: TsconfigKey,
): Promise<Runtime | undefined> {
  const { owner } = await resolveTsconfigEnvironments(config, key);

  const { runtime } = await resolveTsconfigEnvironment(config, owner);

  return runtime;
}
