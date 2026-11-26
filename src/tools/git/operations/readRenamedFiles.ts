import { readHead } from "#tools/git/operations/readHead";
import { runGit } from "#tools/git/operations/runGit";
import { withTemporaryIndex } from "#tools/git/operations/withTemporaryIndex";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * The files the working tree renames since the `HEAD` commit, staged or not,
 * each current path mapped to the one `HEAD` holds it under, paths relative to
 * `root`; empty when there is no commit yet.
 *
 * @throws {Error} When git fails.
 */
// @debt git pairs a rename only above 50% similarity, so a move that also rewrites most of a small file counts as deleted and added
export async function readRenamedFiles(
  root: Directory,
): Promise<ReadonlyMap<File, File>> {
  const head = await readHead(root);

  if (head === undefined) {
    return new Map();
  }

  const output = await withTemporaryIndex(root, async (env) => {
    await runGit(root, ["add", "-A"], env);

    return runGit(
      root,
      [
        "diff",
        "--cached",
        head,
        "--name-status",
        "--find-renames",
        "--diff-filter=R",
        "--relative",
        "-z",
      ],
      env,
    );
  });

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
