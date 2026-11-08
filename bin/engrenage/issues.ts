import { Option } from "@commander-js/extra-typings";

import {
  checkIssue,
  formatIssueCheck,
  resolveGithubToken,
  resolveRepository,
} from "#tools/github/index";
import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";

export const issues = defineLegacyCommand((command) => {
  command
    .command("check")
    .description(
      "Check that an issue meets the issue contract, listing its open sub-issues to walk first; exit 1 with one line per finding otherwise.",
    )
    .argument("<number>", "issue number", Number)
    .option("--repo <owner/repo>", "repository, else package.json or origin")
    .addOption(
      new Option("--for <role>", "who the issue is checked for")
        .choices(["worker", "debugger"] as const)
        .default("worker" as const),
    )
    .action(async (number, { repo, for: audience }) => {
      const check = await checkIssue(
        {
          repository: await resolveRepository(process.cwd(), repo),
          token: await resolveGithubToken(),
        },
        number,
        audience,
      );

      for (const line of formatIssueCheck(number, check)) {
        console.log(line);
      }

      if (check.findings.length > 0) {
        process.exitCode = 1;
      }
    });

  return command;
});
