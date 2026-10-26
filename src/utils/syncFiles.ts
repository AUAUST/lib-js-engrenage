import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import type { FileSync } from "#types/FileSync";
import type { SyncResult } from "#types/SyncResult";
import type { SyncResults } from "#types/SyncResults";
import type { SyncStatus } from "#types/SyncStatus";

function statusOf(exists: boolean, check: boolean): SyncStatus {
  if (check) {
    return "outdated";
  }

  return exists ? "synced" : "created";
}

export function syncFiles({
  root,
  files,
  check,
}: {
  root: Directory | URL;
  files: ReadonlyArray<FileSync>;
  check: boolean;
}): SyncResults {
  const results: SyncResult[] = [];

  for (const { file, initial, update } of files) {
    const path = resolve(root, file);

    const current = existsSync(path) ? readFileSync(path, "utf8") : undefined;

    const content = current ?? initial;

    if (content === undefined) {
      throw new Error(`Cannot sync ${path}: the file does not exist`);
    }

    const synced = update(content, path);

    if (synced === current) {
      continue;
    }

    results.push({
      file,
      status: statusOf(current !== undefined, check),
    });

    if (!check) {
      mkdirSync(dirname(path), {
        recursive: true,
      });

      writeFileSync(path, synced);
    }
  }

  return results;
}
