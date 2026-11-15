import { keys } from "@auaust/toolkit/object";

import type { Lazy } from "#foundation/modules/types/Lazy";
import type { Loadable } from "#foundation/modules/types/Loadable";

function isModuleNamespace<T>(
  loaded: Loadable<T>,
): loaded is { readonly [name: string]: T } {
  return Object.prototype.toString.call(loaded) === "[object Module]";
}

export async function loadLazy<T>(lazy: Lazy<T>): Promise<T> {
  const loaded = await lazy.load();

  if (!isModuleNamespace(loaded)) {
    return loaded;
  }

  const names = keys(loaded);

  if (names.includes("default")) {
    return loaded.default;
  }

  const [name, ...others] = names;

  if (name === undefined || others.length > 0) {
    throw new TypeError(
      `A lazy loader must load a module with a default export or exactly one export; it exports ${names.length === 0 ? "nothing" : names.join(", ")}`,
    );
  }

  return loaded[name];
}
