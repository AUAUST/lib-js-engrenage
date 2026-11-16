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

  const { host } = await config.resolve("src");

  const browser = key === "src" && host === "browser";

  return resolveListOption(
    option,
    () => {
      const library = runtime?.kind === "baseline" ? runtime.lib : ["ESNext"];

      return browser ? [...library, "DOM", "DOM.Iterable"] : library;
    },
    `${key}.tsconfig.lib`,
  );
}
