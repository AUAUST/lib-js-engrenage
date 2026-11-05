import { resolveTsconfigEnvironments } from "#project/tsconfig/operations/resolveTsconfigEnvironments";
import type { Runtime } from "#project/baseline/index";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";

export async function resolveTsconfigRuntime(
  config: ConfigContext,
  key: TsconfigKey,
): Promise<Runtime | undefined> {
  const { owner } = await resolveTsconfigEnvironments(config, key);

  const { runtime } = await config.get(owner);

  return runtime;
}
