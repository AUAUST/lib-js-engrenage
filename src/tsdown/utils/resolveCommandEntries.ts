import { posix } from "node:path";

import { entries } from "@auaust/toolkit/object";

import { binEntryFiles } from "#tsdown/constants";
import { filesIn } from "#utils/filesIn";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Entries } from "#tsdown/types/Entries";
import type { File } from "#types/File";
import type { Files } from "#types/Files";

function toEntryName(file: File): string {
  return posix.basename(file) === "index.ts"
    ? posix.dirname(file)
    : file.slice(0, -posix.extname(file).length);
}

function findCommandFiles({ bin, filesystem }: ResolvedConfig): Files {
  if (bin.commands === undefined) {
    return filesystem.glob(filesIn(bin.dirs, binEntryFiles));
  }

  return entries(bin.commands).map(([command, file]) => {
    if (!filesystem.exists(file)) {
      throw new Error(
        `Command '${command}' points to ${file}, which does not exist`,
      );
    }

    return file;
  });
}

export function resolveCommandEntries(config: ResolvedConfig): Entries {
  const commandEntries: Entries = {};

  for (const file of findCommandFiles(config)) {
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
