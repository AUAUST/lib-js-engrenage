import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute } from "node:path";

import {
  isMissingError,
  isWithin,
  relativeWithin,
  resolveWithin,
} from "#foundation/filesystem/index";
import { buildSourcesFile } from "#project/build/constants";
import { digestSources } from "#project/build/operations/digestSources";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

async function isFile(path: string) {
  try {
    const stats = await stat(path);

    return stats.isFile();
  } catch (error) {
    if (isMissingError(error)) {
      return false;
    }

    throw error;
  }
}

/**
 * Records the files under `root` a build consumed, with their digest, in the
 * project's unpublished state, so a later run can tell whether the output still
 * matches them. Module IDs outside `root` or naming no file, such as virtual
 * modules, are left out.
 */
export function createBuildSources({
  root,
  inputs,
}: {
  root: Directory;
  inputs: readonly File[];
}) {
  const consumed = new Set<string>(inputs);

  const record = resolveWithin(root, buildSourcesFile);

  let failed = false;

  async function removePrevious() {
    await rm(record, { force: true });
  }

  function add(ids: Iterable<string>) {
    for (const id of ids) {
      if (isAbsolute(id) && isWithin(root, id)) {
        consumed.add(relativeWithin(root, id));
      }
    }
  }

  function fail() {
    failed = true;
  }

  async function write() {
    if (failed) {
      return;
    }

    const candidates = [...consumed].sort();

    const present = await Promise.all(
      candidates.map((source) => isFile(resolveWithin(root, source))),
    );

    const sources = candidates.filter((_source, index) => present[index]);

    await mkdir(dirname(record), { recursive: true });

    await writeFile(
      record,
      JSON.stringify({
        sources,
        digest: await digestSources(root, sources),
      }),
    );
  }

  return {
    removePrevious,
    add,
    fail,
    write,
  };
}
