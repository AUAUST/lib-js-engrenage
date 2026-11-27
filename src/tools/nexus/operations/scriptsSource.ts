import { join } from "node:path";

import { directorySource, type CommandLoader } from "#nexus/cli/index";
import { scriptEntry, scriptExecutable } from "#tools/nexus/constants";
import type { Directories } from "#types/Directories";

async function readScriptsDirectories(): Promise<Directories> {
  const { loadValidatedConfig } = await import("#project/config/index");

  const config = await loadValidatedConfig();

  const { active, dirs } = await config.resolve("scripts");

  return active
    ? dirs.map((dir) => {
        return join(config.context.root, dir);
      })
    : [];
}

/**
 * Declares the loader of the project's scripts: a command per directory of its
 * scripts environment's directories holding a program, by the `programs` layout,
 * loading the project's config only once called; shadowable, so a command
 * engrenage provides keeps its name.
 *
 * @pure
 */
export function scriptsSource(): CommandLoader {
  return directorySource({
    directories: readScriptsDirectories,
    entry: scriptEntry,
    executable: scriptExecutable,
    shadowable: true,
  });
}
