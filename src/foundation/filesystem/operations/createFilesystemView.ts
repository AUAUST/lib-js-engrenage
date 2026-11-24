import { posix } from "node:path";

import { toArray } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import { relativeWithin } from "#foundation/filesystem/utils/relativeWithin";
import { resolveWithin } from "#foundation/filesystem/utils/resolveWithin";
import type { Filesystem } from "#foundation/filesystem/apis/Filesystem";
import type { FileFormatter } from "#foundation/filesystem/types/FileFormatter";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";
import type { SyncResults } from "#types/SyncResults";

// @debt the caller must pass `filesystem`'s own root as `root`: `Filesystem` exposes no root to derive it from
/**
 * A `Filesystem` resolving paths against `directory` and staging into
 * `filesystem`, whose paths resolve against `root`. Its `format`, `changes`,
 * `discard` and `flush` are `filesystem`'s, covering every change staged there.
 */
export function createFilesystemView(
  filesystem: Filesystem,
  root: Directory,
  directory: Directory,
): Filesystem {
  const base = resolveWithin(root, directory);
  const prefix = relativeWithin(root, base);

  function locate(path: string): File {
    return relativeWithin(root, resolveWithin(base, path));
  }

  function scope(pattern: Glob): Glob {
    const scoped = posix.join(prefix, pattern);
    const relative = posix.relative(prefix, scoped);

    if (relative === ".." || relative.startsWith("../")) {
      throw new Error(`Pattern "${pattern}" escapes ${base}`);
    }

    return scoped;
  }

  function scopeAll(patterns: Globs = []): Globs {
    return patterns.map(scope);
  }

  function unscope(files: Files): Files {
    return files.map((file) => posix.relative(prefix, file));
  }

  function read(file: File): Promise<string | undefined> {
    return filesystem.read(locate(file));
  }

  function exists(file: File): Promise<boolean> {
    return filesystem.exists(locate(file));
  }

  function isDirectory(path: Directory): Promise<boolean> {
    return filesystem.isDirectory(locate(path));
  }

  function write(file: File, content: string): Promise<void> {
    return filesystem.write(locate(file), content);
  }

  function remove(file: File): Promise<void> {
    return filesystem.remove(locate(file));
  }

  async function glob(
    patterns: Glob | Globs,
    options?: { exclude?: Globs },
  ): Promise<Files> {
    const found = await filesystem.glob(toArray(patterns).map(scope), {
      exclude: scopeAll(options?.exclude),
    });

    return unscope(found);
  }

  function hasFile(
    path: Directory,
    options?: { skip?: Globs },
  ): Promise<boolean> {
    return filesystem.hasFile(locate(path), {
      skip: scopeAll(options?.skip),
    });
  }

  async function list(
    path: Directory,
    options?: { skip?: Globs; recursive?: boolean },
  ): Promise<Files> {
    const found = await filesystem.list(locate(path), {
      skip: scopeAll(options?.skip),
      recursive: options?.recursive ?? true,
    });

    return unscope(found);
  }

  function format(formatter: FileFormatter): Promise<void> {
    return filesystem.format(formatter);
  }

  function changes(): SyncResults {
    return filesystem.changes();
  }

  function discard(): SyncResults {
    return filesystem.discard();
  }

  function flush(): Promise<SyncResults> {
    return filesystem.flush();
  }

  return freeze({
    read,
    exists,
    isDirectory,
    write,
    remove,
    glob,
    hasFile,
    list,
    format,
    changes,
    discard,
    flush,
  });
}
