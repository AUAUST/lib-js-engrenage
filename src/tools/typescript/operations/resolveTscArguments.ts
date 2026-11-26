import { hasOption } from "#foundation/processes/index";
import {
  tscBuildOptions,
  tscProjectOptions,
} from "#tools/typescript/constants";
import { partitionInstanceTsconfigs } from "#tools/typescript/operations/partitionInstanceTsconfigs";
import { resolveTscProjectArguments } from "#tools/typescript/operations/resolveTscProjectArguments";
import type { LoadedConfig } from "#project/config/index";

async function listSkippedTsconfigs(
  config: LoadedConfig,
): Promise<readonly string[]> {
  const { checked, skipped } = await partitionInstanceTsconfigs(config);

  if (checked.length > 0) {
    return skipped;
  }

  throw new Error(
    skipped.length === 0
      ? "No environment is type-checked: none holds a file in its languages"
      : `No environment is type-checked: ${skipped.join(", ")}`,
  );
}

/**
 * The `tsc` arguments checking every instance tsconfig the base tsconfig
 * references, with a description of each instance it skips; `args` naming a
 * project run as given, skipping none.
 *
 * @throws When `args` name no project and no instance tsconfig is checked.
 */
export async function resolveTscArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<{
  args: string[];
  skipped: readonly string[];
}> {
  const skipped = hasOption(args, [...tscBuildOptions, ...tscProjectOptions])
    ? []
    : await listSkippedTsconfigs(config);

  return {
    args: await resolveTscProjectArguments(
      config,
      args,
      await config.resolve("tsconfigPath"),
    ),
    skipped,
  };
}
