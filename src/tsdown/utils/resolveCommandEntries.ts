import { findCommands } from "#tsdown/utils/findCommands";
import { toEntryName } from "#tsdown/utils/toEntryName";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Entries } from "#tsdown/types/Entries";

export function resolveCommandEntries(config: ResolvedConfig): Entries {
  const commandEntries: Entries = {};

  for (const [, file] of findCommands(config)) {
    const name = toEntryName(file);

    const existing = commandEntries[name];

    if (existing !== undefined) {
      throw new Error(
        `Bin entry '${name}' is declared by both ${existing} and ${file}`,
      );
    }

    commandEntries[name] = file;
  }

  return commandEntries;
}
