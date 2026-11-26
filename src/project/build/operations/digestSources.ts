import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { resolveWithin } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * The SHA-256 digest of the paths and contents of `sources`, relative to
 * `root`, in their order.
 *
 * @throws {Error} When a source escapes `root` or cannot be read.
 */
export async function digestSources(
  root: Directory,
  sources: readonly File[],
): Promise<string> {
  const contents = await Promise.all(
    sources.map((source) => readFile(resolveWithin(root, source))),
  );

  const hash = createHash("sha256");

  for (const [index, content] of contents.entries()) {
    hash.update(`${sources[index]}\0${content.byteLength}\0`);

    hash.update(content);
  }

  return hash.digest("hex");
}
