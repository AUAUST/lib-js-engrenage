import { readFile, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

import { isMissingFile } from "#metalbrain/runtimes/hooks/utils/isMissingFile";
import type { Directory } from "#types/Directory";

const gitEntry = ".git";

const gitDirLine = /^gitdir:\s*(?<path>.+?)\s*$/mv;

async function readText(file: string): Promise<string | undefined> {
  try {
    return await readFile(file, "utf-8");
  } catch (error) {
    if (isMissingFile(error)) {
      return;
    }

    throw error;
  }
}

async function findCheckout(
  directory: Directory,
): Promise<{ root: Directory; linked: boolean } | undefined> {
  for (let current = resolve(directory); ; current = dirname(current)) {
    try {
      const entry = await stat(join(current, gitEntry));

      return { root: current, linked: entry.isFile() };
    } catch (error) {
      if (!isMissingFile(error)) {
        throw error;
      }
    }

    if (dirname(current) === current) {
      return;
    }
  }
}

// @debt reads git's worktree files instead of asking git, to load only Node builtins; it assumes the common directory sits in the main worktree, which fails for worktrees of submodules and of separated git directories
/**
 * The main worktree's counterpart of `directory`: the same path within the
 * repository's main worktree when `directory` sits in a linked worktree, otherwise
 * `directory` itself, inside or outside a repository.
 */
export async function resolveMainWorktree(
  directory: Directory,
): Promise<Directory> {
  const checkout = await findCheckout(directory);

  if (checkout?.linked !== true) {
    return resolve(directory);
  }

  const { root } = checkout;

  const link = await readText(join(root, gitEntry));

  const gitDir = link?.match(gitDirLine)?.groups?.path;

  if (gitDir === undefined) {
    throw new Error(`${join(root, gitEntry)} names no gitdir`);
  }

  const linkedGitDir = resolve(root, gitDir);

  const common = await readText(join(linkedGitDir, "commondir"));

  if (common === undefined) {
    return resolve(directory);
  }

  return join(
    dirname(resolve(linkedGitDir, common.trim())),
    relative(root, resolve(directory)),
  );
}
