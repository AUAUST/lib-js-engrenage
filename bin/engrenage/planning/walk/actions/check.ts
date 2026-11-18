import {
  checkIssueTree,
  createGithubClient,
  formatIssueTreeCheck,
  resolveIssueCheckouts,
  resolveRepository,
} from "#tools/github/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  number: number,
  {
    repo,
    depth,
    checkout,
  }: { repo?: string | undefined; depth: number; checkout: readonly string[] },
): Promise<void> {
  const root = process.cwd();

  const config = await loadValidatedConfig(root, {
    reporter: getRunContext().reporter,
  });

  const {
    repositories,
    contract: contractNames,
  } = await config.resolve("github");

  const [repository, checkouts] = await Promise.all([
    resolveRepository({ root, repositories }, repo),
    resolveIssueCheckouts({ root, repositories }, checkout),
  ]);

  const check = await checkIssueTree(
    {
      repository,
      client: await createGithubClient(),
      contractNames,
    },
    number,
    {
      checkouts,
      planDepth: depth,
    },
  );

  for (const line of formatIssueTreeCheck(check)) {
    getRunContext().reporter.log(line);
  }

  if (check.ready.length === 0) {
    process.exitCode = 1;
  }
}
