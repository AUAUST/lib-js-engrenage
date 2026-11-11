import {
  checkIssue,
  createGithubClient,
  formatIssueCheck,
  resolveRepository,
} from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  number: number,
  {
    repo,
    for: audience,
  }: { repo?: string | undefined; for: "worker" | "debugger" },
): Promise<void> {
  const root = process.cwd();

  const config = await loadValidatedConfig(root);

  const { repositories, protocol } = await config.resolve("github");

  const check = await checkIssue(
    {
      repository: await resolveRepository({ root, repositories }, repo),
      client: await createGithubClient(),
      protocol,
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
