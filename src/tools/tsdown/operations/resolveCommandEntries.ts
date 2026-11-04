import { findCommands } from "#tools/tsdown/operations/findCommands";
import { toEntryName } from "#tools/tsdown/utils/toEntryName";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { ResolvedBin } from "#project/environments/types/ResolvedBin";
import type { Entries } from "#tools/tsdown/types/Entries";

export function resolveCommandEntries(config: {
  bin: ResolvedBin;
  filesystem: Filesystem;
}): Entries {
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
