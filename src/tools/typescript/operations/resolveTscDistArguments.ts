import { resolveDistTsconfig } from "#tools/typescript/operations/resolveDistTsconfig";
import { resolveTscProjectArguments } from "#tools/typescript/operations/resolveTscProjectArguments";
import type { LoadedConfig } from "#project/config/index";

export async function resolveTscDistArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[][]> {
  const project = await resolveDistTsconfig(config);

  if (project === undefined) {
    throw new Error(
      "The dist tsconfig is disabled in the engrenage config (tests.dist.tsconfig: false)",
    );
  }

  return resolveTscProjectArguments(config, args, project);
}
