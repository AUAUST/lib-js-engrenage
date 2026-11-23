import { getOwn } from "@auaust/toolkit/object";

import { resolveTsconfigEnvironments } from "#tools/typescript/operations/resolveTsconfigEnvironments";
import type { LoadedConfig } from "#project/config/index";
import type { ResolvedExecution } from "#project/environments/index";
import type { TsconfigKey } from "#project/tsconfig/index";

/**
 * The execution of the registered environment owning the tsconfig of `key`;
 * `undefined` when none is registered under the owner's name.
 */
export async function resolveTsconfigExecution(
  config: LoadedConfig,
  key: TsconfigKey,
): Promise<ResolvedExecution | undefined> {
  const { owner } = await resolveTsconfigEnvironments(config, key);

  return getOwn(await config.resolve("environments.execution"), owner);
}
