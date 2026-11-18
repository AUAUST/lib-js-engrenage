import { join } from "node:path";

import { pathExists } from "#foundation/filesystem/index";
import { gitDirectory } from "#tools/git/constants";
import { findRepositoryRoot } from "#tools/git/index";
import { resolveCurrentRepository } from "#tools/github/issues/api/index";
import type { IssueCheckout } from "#tools/github/issues/contract/types/IssueCheckout";
import type { Directory } from "#types/Directory";

export async function resolveLocalCheckout(
  root: Directory,
): Promise<IssueCheckout | undefined> {
  const [repository, repositoryRoot] = await Promise.all([
    resolveCurrentRepository(root),
    findRepositoryRoot(root),
  ]);

  if (
    repository === undefined ||
    !(await pathExists(join(repositoryRoot, gitDirectory)))
  ) {
    return;
  }

  return {
    repository,
    root,
    ref: "HEAD",
  };
}
