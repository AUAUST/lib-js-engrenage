import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

import { freeze } from "@auaust/toolkit/object";

import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { SyncResult } from "#types/SyncResult";
import type { SyncResults } from "#types/SyncResults";

interface Backup {
  path: File;
  original: string | undefined;
}

function readFromDisk(path: File): string | undefined {
  return existsSync(path) ? readFileSync(path, "utf8") : undefined;
}

function restore({ path, original }: Backup) {
  if (original === undefined) {
    rmSync(path, {
      force: true,
    });
  } else {
    writeFileSync(path, original);
  }
}

export function createDeferredFiles(root: Directory | URL) {
  const pending = new Map<File, string>();

  function read(file: File): string | undefined {
    if (pending.has(file)) {
      return pending.get(file);
    }

    const content = readFromDisk(resolve(root, file));

    if (content !== undefined) {
      pending.set(file, content);
    }

    return content;
  }

  function exists(file: File): boolean {
    return read(file) !== undefined;
  }

  function write(file: File, content: string) {
    if (content === readFromDisk(resolve(root, file))) {
      pending.delete(file);
    } else {
      pending.set(file, content);
    }
  }

  function commit(): SyncResults {
    const results: SyncResult[] = [];
    const backups: Backup[] = [];

    try {
      for (const [file, content] of pending) {
        const path = resolve(root, file);

        const original = readFromDisk(path);

        mkdirSync(dirname(path), {
          recursive: true,
        });

        backups.push({
          path,
          original,
        });

        writeFileSync(path, content);

        results.push({
          file,
          status: original === undefined ? "created" : "synced",
        });
      }
    } catch (error) {
      for (const backup of backups.toReversed()) {
        restore(backup);
      }

      throw error;
    }

    pending.clear();

    return results;
  }

  return freeze({
    read,
    exists,
    write,
    commit,
  });
}
