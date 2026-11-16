import { listTsconfigOwners } from "#tools/typescript/operations/listTsconfigOwners";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import { resolveTscProjectArguments } from "#tools/typescript/operations/resolveTscProjectArguments";
import type { LoadedConfig } from "#project/config/index";

async function hasReferencedEnvironment(
  config: LoadedConfig,
): Promise<boolean> {
  for (const owner of await listTsconfigOwners(config)) {
    const { tsconfig } = await resolveTsconfigEnvironment(config, owner);

    if (tsconfig.check) {
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
