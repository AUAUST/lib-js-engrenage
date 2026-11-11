import { resolveCurrentRepository } from "#tools/github/issues/api/operations/resolveCurrentRepository";
import type { Directory } from "#types/Directory";

export async function resolveRepository(
  {
    root,
    repositories,
  }: {
    root: Directory;
    repositories: ReadonlyMap<string, string>;
  },
  explicit?: string,
): Promise<string> {
  if (explicit?.includes("/")) {
    return explicit;
  }

  if (explicit !== undefined) {
    const registered = repositories.get(explicit);

    if (registered === undefined) {
      throw new Error(
        `Unknown repository short name \`${explicit}\`; registered: ${[...repositories.keys()].join(", ") || "none"}`,
      );
    }

    return registered;
  }

  const current = await resolveCurrentRepository(root);

  if (current === undefined) {
    throw new Error(
      "Cannot tell the GitHub repository: pass --repo <owner/repo or short name>, or set `repository` in package.json",
    );
  }

  return current;
}
