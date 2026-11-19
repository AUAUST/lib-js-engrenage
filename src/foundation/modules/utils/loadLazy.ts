import { isObject } from "@auaust/toolkit";
import { getOwn, keys } from "@auaust/toolkit/object";

import type { Lazy } from "#foundation/modules/types/Lazy";
import type { Loadable } from "#foundation/modules/types/Loadable";

function isModuleNamespace<T>(
  loaded: Loadable<T>,
): loaded is { readonly [name: string]: T } {
  if (Object.prototype.toString.call(loaded) === "[object Module]") {
    return true;
  }

  return isObject(loaded) && getOwn(loaded, "__esModule") === true;
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

  // @debt infers the value from the namespace's export count, which bundling does not preserve (rolldown 1.3 leaves dead internal exports on lazily loaded chunks); kept only for third-party loaders until they select their export by name
  const [name, ...others] = names;

  if (name === undefined || others.length > 0) {
    throw new TypeError(
      `A lazy loader must load a module with a default export or exactly one export; it exports ${names.length === 0 ? "nothing" : names.join(", ")}`,
    );
  }

  return loaded[name];
}
