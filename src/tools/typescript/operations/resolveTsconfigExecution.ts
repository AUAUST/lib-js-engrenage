import { getOwn } from "@auaust/toolkit/object";

import { toTsconfigEnvironment } from "#tools/typescript/utils/toTsconfigEnvironment";
import type { LoadedConfig } from "#project/config/index";
import type { ResolvedExecution } from "#project/environments/index";
import type { TsconfigKey } from "#project/tsconfig/index";
import type { Directory } from "#types/Directory";

/**
 * The execution of the registered environment the tsconfig of `key` checks,
 * resolved through the config of its `scope`; `undefined` when none is registered
 * there under its name.
 */
export async function resolveTsconfigExecution(
  config: LoadedConfig,
  { key, scope }: { key: TsconfigKey; scope: Directory },
): Promise<ResolvedExecution | undefined> {
  const scoped = await config.context.scope(scope);

  return getOwn(
    await scoped.resolve("environments.execution"),
    toTsconfigEnvironment(key),
  );
}
