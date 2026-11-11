import { runGit } from "#tools/git/index";
import { readManifestRepository } from "#tools/github/issues/api/operations/readManifestRepository";
import { parseRepository } from "#tools/github/issues/api/utils/parseRepository";
import type { Directory } from "#types/Directory";

async function readOriginRepository(root: Directory) {
  let url: string;

  try {
    url = await runGit(root, ["remote", "get-url", "origin"]);
  } catch {
    // @debt treats any git failure as a missing `origin` remote instead of telling a missing remote from a git failure
    return;
  }

  return parseRepository(url);
}

export async function resolveCurrentRepository(
  root: Directory,
): Promise<string | undefined> {
  return (
    (await readManifestRepository(root)) ?? (await readOriginRepository(root))
  );
}
