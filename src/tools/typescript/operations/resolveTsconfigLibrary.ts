import { resolveListOption } from "#foundation/options/index";
import { memoizeByContext, type LoadedConfig } from "#project/config/index";
import { resolveTsconfigExecution } from "#tools/typescript/operations/resolveTsconfigExecution";
import { toTsconfigOptionPath } from "#tools/typescript/utils/toTsconfigOptionPath";
import type { TsconfigTarget } from "#project/tsconfig/index";

const librariesOf = memoizeByContext(() => {
  return new Map<string, Promise<readonly string[] | false>>();
});

async function computeTsconfigLibrary(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly string[] | false> {
  const { key, lib: option } = target;

  if (key === "base") {
    return false;
  }

  const execution = await resolveTsconfigExecution(config, key);

  const runtime = execution?.runtime;

  if (runtime === undefined && (option == null || option === true)) {
    return false;
  }

  const browser = execution?.globals === "browser";

  return resolveListOption(
    option,
    () => {
      const library = runtime?.kind === "baseline" ? runtime.lib : ["ESNext"];

      return browser ? [...library, "DOM", "DOM.Iterable"] : library;
    },
    `${toTsconfigOptionPath(key)}.lib`,
    config.context.reporter,
  );
}

export function resolveTsconfigLibrary(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly string[] | false> {
  const libraries = librariesOf(config.context);

  const known = libraries.get(target.key);

  if (known !== undefined) {
    return known;
  }

  const pending = computeTsconfigLibrary(config, target);

  libraries.set(target.key, pending);

  return pending;
}
