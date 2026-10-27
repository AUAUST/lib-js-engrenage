import {
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, matchesGlob } from "node:path";

import { deduplicate, map, sort, wrap } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import { toPosixPath } from "#support/filesystem/utils/toPosixPath";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";
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

export function createFilesystem(root: Directory) {
  const contents = new Map<File, string | undefined>();
  const originals = new Map<File, string | undefined>();

  function locate(file: File): File {
    return relativeWithin(root, file);
  }

  function readLocated(file: File): string | undefined {
    if (!contents.has(file)) {
      contents.set(file, readFromDisk(resolveWithin(root, file)));
    }

    return contents.get(file);
  }

  function read(file: File): string | undefined {
    return readLocated(locate(file));
  }

  function exists(file: File): boolean {
    return read(file) !== undefined;
  }

  function write(file: File, content: string) {
    const located = locate(file);

    const current = readLocated(located);

    if (!originals.has(located)) {
      originals.set(located, current);
    }

    contents.set(located, content);

    if (originals.get(located) === content) {
      originals.delete(located);
    }
  }

  function glob(patterns: Glob | Globs): Files {
    const globs = wrap(patterns);

    const found = map(
      globSync(globs, {
        cwd: root,
      }),
      toPosixPath,
    );

    const created = [...originals.keys()].filter((file) => {
      return globs.some((pattern) => matchesGlob(file, pattern));
    });

    return sort(deduplicate([...found, ...created]));
  }

  function changes(): SyncResults {
    return map(originals, ([file, original]) => {
      return {
        file,
        status: original === undefined ? "created" : "synced",
      };
    });
  }

  function discard(): SyncResults {
    const discarded = changes();

    for (const [file, original] of originals) {
      contents.set(file, original);
    }

    originals.clear();

    return discarded;
  }

  function flush(): SyncResults {
    const results: SyncResult[] = [];
    const backups: Backup[] = [];

    try {
      for (const result of changes()) {
        const path = resolveWithin(root, result.file);

        mkdirSync(dirname(path), {
          recursive: true,
        });

        backups.push({
          path,
          original: readFromDisk(path),
        });

        writeFileSync(path, readLocated(result.file) ?? "");

        results.push(result);
      }
    } catch (error) {
      for (const backup of backups.toReversed()) {
        restore(backup);
      }

      throw error;
    }

    originals.clear();

    return results;
  }

  return freeze({
    read,
    exists,
    write,
    glob,
    changes,
    discard,
    flush,
  });
}
