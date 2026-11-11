import {
  checkIssueTree,
  createGithubClient,
  formatIssueTreeCheck,
  resolveRepository,
} from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  number: number,
  { repo }: { repo?: string | undefined },
): Promise<void> {
  const root = process.cwd();

  const config = await loadValidatedConfig(root);

  const { repositories } = await config.resolve("github");

  const check = await checkIssueTree(
    {
      repository: await resolveRepository({ root, repositories }, repo),
      client: await createGithubClient(),
    },
    number,
    {
      root,
    },
  );

  for (const line of formatIssueTreeCheck(check)) {
    console.log(line);
  }

  if (check.next === undefined) {
    process.exitCode = 1;
  }
}
