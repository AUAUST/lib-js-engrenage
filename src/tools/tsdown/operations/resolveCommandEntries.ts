import { getIndexFile } from "#project/structure/index";
import { findCommands } from "#tools/tsdown/utils/findCommands";
import { toEntryName } from "#tools/tsdown/utils/toEntryName";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedBin } from "#project/environments/index";
import type { Entries } from "#tools/tsdown/types/Entries";

export async function resolveCommandEntries(config: {
  bin: ResolvedBin;
  filesystem: Filesystem;
}): Promise<Entries> {
  const commandEntries: Entries = {};

  const indexFile = getIndexFile(config.bin.roles);

  for (const [, file] of await findCommands(config)) {
    const name = toEntryName(file, indexFile);

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
