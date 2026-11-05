import { deduplicate } from "@auaust/primitive-kit/arrays";

import { runGit } from "#tools/git/operations/runGit";
import type { ChangeMode } from "#tools/git/types/ChangeMode";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

const diffArguments = [
  "--name-only",
  "--relative",
  "--diff-filter=ACMR",
  "-z",
] as const;

function splitPaths(output: string): Files {
  return output.split("\0").filter((path) => path !== "");
}

export async function listChangedFiles(
  root: Directory,
  mode: ChangeMode,
): Promise<Files> {
  if (mode === "staged") {
    return splitPaths(
      await runGit(root, ["diff", "--cached", ...diffArguments]),
    );
  }

  const [tracked, untracked] = await Promise.all([
    runGit(root, ["diff", "HEAD", ...diffArguments]),
    runGit(root, ["ls-files", "--others", "--exclude-standard", "-z"]),
  ]);

  return deduplicate([...splitPaths(tracked), ...splitPaths(untracked)]);
}
