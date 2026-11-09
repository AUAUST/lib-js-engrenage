import { listTsconfigEnvironments } from "#tools/typescript/operations/listTsconfigEnvironments";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import { resolveTscProjectArguments } from "#tools/typescript/operations/resolveTscProjectArguments";
import type { LoadedConfig } from "#project/config/index";

async function hasReferencedEnvironment(
  config: LoadedConfig,
): Promise<boolean> {
  for (const name of await listTsconfigEnvironments(config)) {
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
): Promise<string[] | undefined> {
  if (!(await hasReferencedEnvironment(config))) {
    return;
  }

  return resolveTscProjectArguments(
    config,
    args,
    await config.resolve("tsconfigPath"),
  );
}
