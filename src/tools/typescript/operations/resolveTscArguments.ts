import { listReferencedTsconfigs } from "#tools/typescript/operations/listReferencedTsconfigs";
import { resolveTscProjectArguments } from "#tools/typescript/operations/resolveTscProjectArguments";
import type { LoadedConfig } from "#project/config/index";

export async function resolveTscArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[] | undefined> {
  const referenced = await listReferencedTsconfigs(config);

  if (referenced.length === 0) {
    return;
  }

  return resolveTscProjectArguments(
    config,
    args,
    await config.resolve("tsconfigPath"),
  );
}
