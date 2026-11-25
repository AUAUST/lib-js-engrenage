import { runGit } from "#tools/git/operations/runGit";
import type { StagedChanges } from "#tools/git/types/StagedChanges";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const diffArguments = [
  "-c",
  "core.quotePath=false",
  "diff",
  "--cached",
  "--relative",
  "--no-color",
  "--no-ext-diff",
  "--unified=0",
] as const;

function readPath(line: string, prefix: string): File | undefined {
  const path = line.slice(4);

  return path === "/dev/null" ? undefined : path.slice(prefix.length);
}

/**
 * The files the staged changes touch and the lines they add, read from one
 * `git diff --cached`, paths relative to `root`.
 *
 * @throws {Error} When git fails.
 */
export async function readStagedChanges(
  root: Directory,
): Promise<StagedChanges> {
  const output = await runGit(root, diffArguments);

  const files: File[] = [];
  const added: string[] = [];

  let header = false;
  let removed: File | undefined;

  for (const line of output.split("\n")) {
    if (line.startsWith("diff --git ")) {
      header = true;
      removed = undefined;
    } else if (header && line.startsWith("--- ")) {
      removed = readPath(line, "a/");
    } else if (header && line.startsWith("+++ ")) {
      const file = readPath(line, "b/") ?? removed;

      if (file !== undefined) {
        files.push(file);
      }
    } else if (line.startsWith("@@")) {
      header = false;
    } else if (!header && line.startsWith("+")) {
      added.push(line.slice(1));
    }
  }

  return { files, added };
}
