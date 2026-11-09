import { tsconfigEnvironments } from "#project/tsconfig/index";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import { resolveTscProjectArguments } from "#tools/typescript/operations/resolveTscProjectArguments";
import type { LoadedConfig } from "#project/config/index";

async function hasReferencedEnvironment(
  config: LoadedConfig,
): Promise<boolean> {
  for (const name of tsconfigEnvironments) {
    const { active, tsconfig } = await resolveTsconfigEnvironment(config, name);

    const { owner, check } = tsconfig;

    if (active && owner === name && check) {
      return true;
    }
  }

  return false;
}

export async function resolveTscArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[]> {
  const project = await config.resolve("tsconfigPath");

  if (!(await hasReferencedEnvironment(config))) {
    throw new Error(
      "No environment is referenced by the base tsconfig: every active environment has `check: false`",
    );
  }

  return resolveTscProjectArguments(config, args, project);
}
