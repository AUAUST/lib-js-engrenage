import { readHead } from "#tools/git/operations/readHead";
import { runGit } from "#tools/git/operations/runGit";
import type { IssueCommit } from "#tools/git/types/IssueCommit";
import type { Directory } from "#types/Directory";

const referencePattern = /^(Closes|Towards) #(\d+)$/gmu;

const referenceGrep = "--grep=^(Closes|Towards) #[0-9]+$";

function parseCommit(
  record: string,
  unpushed: ReadonlySet<string>,
): IssueCommit {
  const [
    fullHash = "",
    hash = "",
    subject = "",
    message = "",
  ] = record.split("\x1f");

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
    pushed: !unpushed.has(fullHash),
  };
}

export async function listIssueCommits(
  root: Directory,
): Promise<readonly IssueCommit[]> {
  if ((await readHead(root)) === undefined) {
    return [];
  }

  const [output, unpushedOutput] = await Promise.all([
    runGit(root, [
      "log",
      "-z",
      "-E",
      referenceGrep,
      "--format=%H%x1f%h%x1f%s%x1f%B",
      "HEAD",
    ]),
    runGit(root, [
      "rev-list",
      "-E",
      referenceGrep,
      "HEAD",
      "--not",
      "--remotes",
    ]),
  ]);

  const unpushed = new Set(
    unpushedOutput
      .split("\n")
      .map((line) => {
        return line.trim();
      })
      .filter((line) => {
        return line !== "";
      }),
  );

  return output
    .split("\0")
    .filter((record) => record !== "")
    .map((record) => parseCommit(record, unpushed));
}
