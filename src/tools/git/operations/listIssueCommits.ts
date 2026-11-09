import { readHead } from "#tools/git/operations/readHead";
import { runGit } from "#tools/git/operations/runGit";
import type { IssueCommit } from "#tools/git/types/IssueCommit";
import type { Directory } from "#types/Directory";

const referencePattern = /^(Closes|Towards) #(\d+)$/gmu;

function parseCommit(record: string): IssueCommit {
  const [hash = "", subject = "", message = ""] = record.split("\x1f");

  const closes: number[] = [];
  const towards: number[] = [];

  for (const [, keyword, number] of message.matchAll(referencePattern)) {
    (keyword === "Closes" ? closes : towards).push(Number(number));
  }

  return {
    hash,
    subject,
    closes,
    towards,
  };
}

export async function listIssueCommits(
  root: Directory,
): Promise<readonly IssueCommit[]> {
  if ((await readHead(root)) === undefined) {
    return [];
  }

  const output = await runGit(root, [
    "log",
    "-z",
    "-E",
    "--grep=^(Closes|Towards) #[0-9]+$",
    "--format=%h%x1f%s%x1f%B",
    "HEAD",
  ]);

  return output
    .split("\0")
    .filter((record) => record !== "")
    .map(parseCommit);
}
