import { resolveListOption } from "#foundation/options/index";
import { resolveTsconfigRuntime } from "#project/tsconfig/operations/resolveTsconfigRuntime";
import type { ProjectConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

// @debt both tsconfig producers call this, so a warning raised by resolveListOption for `<env>.tsconfig.lib` can print twice
export function resolveTsconfigLibrary(
  config: ProjectConfig,
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
