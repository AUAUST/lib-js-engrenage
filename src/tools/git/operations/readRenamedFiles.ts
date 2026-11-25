import { readHead } from "#tools/git/operations/readHead";
import { runGit } from "#tools/git/operations/runGit";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * The files renamed since the `HEAD` commit, each current path mapped to
 * the one `HEAD` holds it under, paths relative to `root`; empty when there
 * is no commit yet.
 *
 * @throws {Error} When git fails.
 */
// @debt git detects renames only among tracked files, so a file moved without staging its new path counts as deleted and added
export async function readRenamedFiles(
  root: Directory,
): Promise<ReadonlyMap<File, File>> {
  const head = await readHead(root);

  if (head === undefined) {
    return new Map();
  }

  const output = await runGit(root, [
    "diff",
    head,
    "--name-status",
    "--find-renames",
    "--diff-filter=R",
    "--relative",
    "-z",
  ]);

  const fields = output.split("\0");

  const renamed = new Map<File, File>();

  for (let index = 0; index + 2 < fields.length; index += 3) {
    const previous = fields[index + 1];
    const current = fields[index + 2];

    if (previous === undefined || current === undefined) {
      throw new Error(`Cannot read git renames from: ${output}`);
    }

    renamed.set(current, previous);
  }

  return renamed;
}
