import { runGit } from "#tools/git/index";
import { parseRepository } from "#tools/github/utils/parseRepository";
import type { Directory } from "#types/Directory";

export async function readOriginRepository(
  root: Directory,
): Promise<string | undefined> {
  let url: string;

  try {
    url = await runGit(root, ["remote", "get-url", "origin"]);
  } catch {
    // @debt treats any git failure as a missing `origin` remote instead of telling a missing remote from a git failure
    return;
  }

  return parseRepository(url);
}
