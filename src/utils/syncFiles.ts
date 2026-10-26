import { resolve } from "#support/filesystem/utils/resolve";
import { createDeferredFiles } from "#support/scaffold/utils/createDeferredFiles";
import type { Directory } from "#types/Directory";
import type { FileSync } from "#types/FileSync";
import type { SyncResult } from "#types/SyncResult";
import type { SyncResults } from "#types/SyncResults";

export function syncFiles({
  root,
  files,
  check,
}: {
  root: Directory | URL;
  files: ReadonlyArray<FileSync>;
  check: boolean;
}): SyncResults {
  const deferred = createDeferredFiles(root);
  const results: SyncResult[] = [];

  for (const { file, update } of files) {
    const current = deferred.read(file);

    if (current === undefined) {
      continue;
    }

    const synced = update(current, resolve(root, file));

    if (synced === current) {
      continue;
    }

    results.push({
      file,
      status: check ? "outdated" : "synced",
    });

    deferred.write(file, synced);
  }

  if (!check) {
    deferred.commit();
  }

  return results;
}
