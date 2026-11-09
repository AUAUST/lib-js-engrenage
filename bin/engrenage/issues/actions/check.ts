import {
  checkIssue,
  formatIssueCheck,
  resolveGithubToken,
  resolveRepository,
} from "#tools/github/index";

export default async function (
  number: number,
  {
    repo,
    for: audience,
  }: { repo?: string | undefined; for: "worker" | "debugger" },
): Promise<void> {
  const root = process.cwd();

  const check = await checkIssue(
    {
      repository: await resolveRepository(root, repo),
      token: await resolveGithubToken(),
    },
    number,
    audience,
    {
      root,
    },
  );

  for (const line of formatIssueCheck(number, check)) {
    console.log(line);
  }

  if (check.findings.length > 0) {
    process.exitCode = 1;
  }
}
