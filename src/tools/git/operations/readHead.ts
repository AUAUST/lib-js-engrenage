import { readCommit } from "#tools/git/operations/readCommit";
import type { Directory } from "#types/Directory";

export async function readHead(root: Directory): Promise<string | undefined> {
  return readCommit(root, "HEAD");
}
