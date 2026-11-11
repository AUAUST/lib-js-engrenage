import { resolveCurrentRepository } from "#tools/github/issues/api/operations/resolveCurrentRepository";
import { findRegisteredRepository } from "#tools/github/issues/api/utils/findRegisteredRepository";
import type { Directory } from "#types/Directory";

export async function resolveRepository(
  {
    root,
    repositories,
  }: {
    root: Directory;
    repositories(): Promise<ReadonlyMap<string, string>>;
  },
  explicit?: string,
): Promise<string> {
  if (explicit?.includes("/")) {
    return explicit;
  }

  if (explicit !== undefined) {
    return findRegisteredRepository(await repositories(), explicit);
  }

  const current = await resolveCurrentRepository(root);

  if (current === undefined) {
    throw new Error(
      "Cannot tell the GitHub repository: pass --repo <owner/repo or short name>, or set `repository` in package.json",
    );
  }

  return current;
}
