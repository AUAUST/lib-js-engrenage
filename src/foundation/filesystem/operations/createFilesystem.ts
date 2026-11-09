import {
  glob as globFiles,
  mkdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, matchesGlob } from "node:path";

import { deduplicate, map, sort, wrap } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { readTextFile } from "#foundation/filesystem/operations/readTextFile";
import { isMissingError } from "#foundation/filesystem/utils/isMissingError";
import { relativeWithin } from "#foundation/filesystem/utils/relativeWithin";
import { resolveWithin } from "#foundation/filesystem/utils/resolveWithin";
import { toPosixPath } from "#foundation/filesystem/utils/toPosixPath";
import type { FileFormatter } from "#foundation/filesystem/types/FileFormatter";
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

async function restore({ path, original }: Backup) {
  if (original === undefined) {
    await rm(path, {
      force: true,
    });
  } else {
    await writeFile(path, original);
  }
}

function isExcluded(file: File, exclude: Globs): boolean {
  const segments = file.split("/");

  return segments.some((_, index) => {
    const path = segments.slice(0, index + 1).join("/");

    return exclude.some((pattern) => matchesGlob(path, pattern));
  });
}

export function createFilesystem(root: Directory) {
  const contents = new Map<File, string | undefined>();
  const originals = new Map<File, string | undefined>();

  function locate(file: File): File {
    return relativeWithin(root, file);
  }

  async function readLocated(file: File): Promise<string | undefined> {
    if (!contents.has(file)) {
      const content = await readTextFile(resolveWithin(root, file));

      if (!contents.has(file)) {
        contents.set(file, content);
      }
    }

    return contents.get(file);
  }

  function read(file: File): Promise<string | undefined> {
    return readLocated(locate(file));
  }

  async function exists(file: File): Promise<boolean> {
    return (await read(file)) !== undefined;
  }

  async function isDirectory(directory: Directory): Promise<boolean> {
    try {
      const stats = await stat(resolveWithin(root, directory));

      return stats.isDirectory();
    } catch (error) {
      if (isMissingError(error)) {
        return false;
      }

      throw error;
    }
  }

  async function stage(file: File, content: string | undefined) {
    const located = locate(file);

    const current = await readLocated(located);

    if (!originals.has(located)) {
      originals.set(located, current);
    }

    contents.set(located, content);

    if (originals.get(located) === content) {
      originals.delete(located);
    }
  }

  function write(file: File, content: string): Promise<void> {
    return stage(file, content);
  }

  function remove(file: File): Promise<void> {
    return stage(file, undefined);
  }

  async function glob(
    patterns: Glob | Globs,
    options?: { exclude?: Globs },
  ): Promise<Files> {
    const globs = wrap(patterns);
    const exclude = options?.exclude ?? [];

    const found = map(
      await Array.fromAsync(
        globFiles(globs, {
          cwd: root,
          exclude: [...exclude],
        }),
      ),
      toPosixPath,
    );

    const created = originals.keys().filter((file) => {
      return (
        globs.some((pattern) => matchesGlob(file, pattern)) &&
        !isExcluded(file, exclude)
      );
    });

    return sort(deduplicate([...found, ...created])).filter((file) => {
      return !contents.has(file) || contents.get(file) !== undefined;
    });
  }

  async function format(formatter: FileFormatter) {
    for (const file of originals.keys()) {
      const content = await readLocated(file);

      if (content === undefined) {
        continue;
      }

      const formatted = await formatter(resolveWithin(root, file), content);

      if (formatted !== undefined) {
        await stage(file, formatted);
      }
    }
  }

  function changes(): SyncResults {
    return map(originals, ([file, original]) => {
      return {
        file,
        status:
          contents.get(file) === undefined
            ? "deleted"
            : original === undefined
              ? "created"
              : "synced",
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

  async function flush(): Promise<SyncResults> {
    const results: SyncResult[] = [];
    const backups: Backup[] = [];

    try {
      for (const result of changes()) {
        const path = resolveWithin(root, result.file);

        await mkdir(dirname(path), {
          recursive: true,
        });

        backups.push({
          path,
          original: await readTextFile(path),
        });

        const content = contents.get(result.file);

        if (content === undefined) {
          await rm(path, { force: true });
        } else {
          await writeFile(path, content);
        }

        results.push(result);
      }
    } catch (error) {
      for (const backup of backups.toReversed()) {
        await restore(backup);
      }

      throw error;
    }

    originals.clear();

    return results;
  }

  return freeze({
    read,
    exists,
    isDirectory,
    write,
    remove,
    glob,
    format,
    changes,
    discard,
    flush,
  });
}
