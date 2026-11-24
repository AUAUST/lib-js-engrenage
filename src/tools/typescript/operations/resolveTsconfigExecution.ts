import { getOwn } from "@auaust/toolkit/object";

import { toTsconfigEnvironment } from "#tools/typescript/utils/toTsconfigEnvironment";
import type { LoadedConfig } from "#project/config/index";
import type { ResolvedExecution } from "#project/environments/index";
import type { TsconfigKey } from "#project/tsconfig/index";

/**
 * The execution of the registered environment the tsconfig of `key` checks;
 * `undefined` when none is registered under its name.
 */
export async function resolveTsconfigExecution(
  config: LoadedConfig,
  key: TsconfigKey,
): Promise<ResolvedExecution | undefined> {
  return getOwn(
    await config.resolve("environments.execution"),
    toTsconfigEnvironment(key),
  );
}
