import { posix } from "node:path";

import { getIndexFile } from "#project/structure/index";
import { builtExtension } from "#tools/tsdown/constants";
import { findCommands } from "#tools/tsdown/utils/findCommands";
import { toEntryName } from "#tools/tsdown/utils/toEntryName";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedBin } from "#project/environments/index";

export function resolveCommandFiles(
  config: { bin: ResolvedBin; filesystem: Filesystem },
  outDir: string,
): Record<string, string> {
  const commandFiles: Record<string, string> = {};

  const indexFile = getIndexFile(config.bin.roles);

  for (const [command, file] of findCommands(config)) {
    if (command in commandFiles) {
      throw new Error(`Command '${command}' is declared more than once`);
    }

    commandFiles[command] =
      `./${posix.join(outDir, `${toEntryName(file, indexFile)}${builtExtension}`)}`;
  }

  return commandFiles;
}
