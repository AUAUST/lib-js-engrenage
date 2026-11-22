import { readHead } from "#tools/git/operations/readHead";
import { runGit } from "#tools/git/operations/runGit";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * Reads `file`, relative to `root`, as the `HEAD` commit holds it; `undefined`
 * when there is no commit yet or it holds no such file.
 */
export async function readCommittedFile(
  root: Directory,
  file: File,
): Promise<string | undefined> {
  const head = await readHead(root);

  if (head === undefined) {
    return;
  }

  const listed = await runGit(root, [
    "ls-tree",
    "--name-only",
    head,
    "--",
    file,
  ]);

  if (listed === "") {
    return;
  }

  return runGit(root, ["show", `${head}:./${file}`]);
}
