import { posix } from "node:path";

import { builtExtension } from "#tsdown/constants";
import { findCommands } from "#tsdown/utils/findCommands";
import { toEntryName } from "#tsdown/utils/toEntryName";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

export function resolveCommandFiles(
  config: ResolvedConfig,
  outDir: string,
): Record<string, string> {
  const commandFiles: Record<string, string> = {};

  for (const [command, file] of findCommands(config)) {
    if (command in commandFiles) {
      throw new Error(`Command '${command}' is declared more than once`);
    }

    commandFiles[command] =
      `./${posix.join(outDir, `${toEntryName(file)}${builtExtension}`)}`;
  }

  return commandFiles;
}
