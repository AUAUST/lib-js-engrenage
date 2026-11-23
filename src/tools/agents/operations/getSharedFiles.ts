import { readFile } from "node:fs/promises";
import { basename } from "node:path";

import { sort } from "@auaust/toolkit/array";

import { listDataFiles } from "#foundation/data/index";
import { createFragmentSources } from "#metalbrain/facts/index";
import {
  metalbrain,
  sharedFilesKind,
} from "#metalbrain/instructions/constants";
import type { Extension } from "#project/config/index";

/**
 * The supporting files several skills share, shipped by engrenage and the given
 * extensions under `metalbrain/shared/`, sorted by file name.
 *
 * @throws {Error} Two origins ship a shared file of the same name.
 */
export async function getSharedFiles(extensions: readonly Extension[]) {
  const shipped = await Promise.all(
    createFragmentSources(extensions).origins.map((origin) => {
      return listDataFiles(origin, `./${metalbrain}/${sharedFilesKind}/*.md`);
    }),
  );

  const references = new Map<string, string>();

  for (const { file, specifier } of shipped.flat()) {
    const name = basename(file);

    const first = references.get(name);

    if (first !== undefined) {
      throw new Error(
        `Shared agent file "${name}" is shipped twice: ${first} and ${specifier}`,
      );
    }

    references.set(name, specifier);
  }

  const files = await Promise.all(
    shipped.flat().map(async ({ file, specifier }) => {
      return {
        name: basename(file),
        source: file,
        reference: specifier,
        body: await readFile(file, "utf-8"),
      };
    }),
  );

  return sort(files, (left, right) => left.name.localeCompare(right.name));
}
