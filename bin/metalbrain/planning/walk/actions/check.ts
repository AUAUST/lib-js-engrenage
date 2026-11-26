import { getRunContext } from "#nexus/cli/index";
import {
  checkIssueTree,
  createGithubClient,
  formatIssueTreeCheck,
  resolveIssueCheckouts,
  resolveRepository,
} from "#tools/github/index";
import { readLinkedCheckouts } from "#tools/pnpm/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  number: number,
  {
    repo,
    depth,
    checkout,
  }: { repo?: string | undefined; depth: number; checkout: readonly string[] },
): Promise<void> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  const { root } = config.context;

  const {
    repositories,
    contract: contractNames,
  } = await config.resolve("github");

  const [repository, checkouts] = await Promise.all([
    resolveRepository({ root, repositories }, repo),
    readLinkedCheckouts(root).then((linked) => {
      return resolveIssueCheckouts(
        {
          root,
          repositories,
          linked,
        },
        checkout,
      );
    }),
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

  if (!check.finished && check.ready.length === 0) {
    process.exitCode = 1;
  }
}
