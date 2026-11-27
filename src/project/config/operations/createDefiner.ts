import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { isString } from "@auaust/toolkit";
import { assign } from "@auaust/toolkit/object";

import { loadConfig } from "#project/config/operations/loadConfig";
import type { Definer } from "#project/config/apis/Definer";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { Directory } from "#types/Directory";

function directoryOf(root: Directory | URL): Directory {
  if (isString(root)) {
    return root;
  }

  const path = fileURLToPath(root);

  return root.pathname.endsWith("/") ? path : dirname(path);
}

/**
 * Creates a definer running `define` with a `load` resolving the config of the
 * working directory at load time, its `at(root)` with the config of the project
 * holding `root`: a directory, or a file URL such as `import.meta.url`.
 *
 * @pure
 */
export function createDefiner<Args extends readonly unknown[], Result>(
  define: (load: () => Promise<LoadedConfig>, ...args: Args) => Result,
): Definer<Args, Result> {
  // @debt an unbound definer, and Prettier's `package.json` reference, load the config of `process.cwd()`, not of the project owning the tool config file
  /** @effectful */
  function unbound(...args: Args): Result {
    return define(() => loadConfig(), ...args);
  }

  return assign(unbound, {
    at(root: Directory | URL) {
      const directory = directoryOf(root);

      /** @effectful */
      function bound(...args: Args): Result {
        return define(() => loadConfig(directory), ...args);
      }

      return bound;
    },
  });
}
