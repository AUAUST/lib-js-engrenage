import { resolveEnvironmentTsconfig } from "#project/environments/index";
import { listTsconfigEnvironments } from "#tools/typescript/operations/listTsconfigEnvironments";
import { resolveTscProjectArguments } from "#tools/typescript/operations/resolveTscProjectArguments";
import type { LoadedConfig } from "#project/config/index";

async function hasReferencedEnvironment(
  config: LoadedConfig,
): Promise<boolean> {
  for (const name of await listTsconfigEnvironments(config)) {
    const tsconfig = await resolveEnvironmentTsconfig(config, name);

    if (tsconfig.check && tsconfig.file !== undefined) {
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
