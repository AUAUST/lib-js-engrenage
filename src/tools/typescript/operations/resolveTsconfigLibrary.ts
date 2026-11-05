import { resolveListOption } from "#foundation/options/index";
import { resolveTsconfigRuntime } from "#tools/typescript/operations/resolveTsconfigRuntime";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/index";

// @debt both tsconfig producers call this, so a warning raised by resolveListOption for `<env>.tsconfig.lib` can print twice
export async function resolveTsconfigLibrary(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly string[] | false> {
  const { key, lib: option } = target;

  if (key === "base") {
    return false;
  }

  const runtime = await resolveTsconfigRuntime(config, key);

  if (runtime === undefined && (option == null || option === true)) {
    return false;
  }

  return resolveListOption(
    option,
    () => {
      return runtime?.kind === "baseline" ? runtime.lib : ["ESNext"];
    },
    `${key}.tsconfig.lib`,
  );
}
