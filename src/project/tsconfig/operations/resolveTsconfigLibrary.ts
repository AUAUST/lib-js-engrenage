import { resolveListOption } from "#config/operations/resolveListOption";
import { resolveTsconfigRuntime } from "#tsconfig/operations/resolveTsconfigRuntime";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";

// @debt both tsconfig producers call this, so a warning raised by resolveListOption for `<env>.tsconfig.lib` can print twice
export function resolveTsconfigLibrary(
  config: ResolvedConfig,
  target: TsconfigTarget,
): readonly string[] | false {
  const { key, lib: option } = target;

  if (key === "base") {
    return false;
  }

  const runtime = resolveTsconfigRuntime(config, key);

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
