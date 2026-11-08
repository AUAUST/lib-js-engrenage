import { Option } from "@commander-js/extra-typings";

import {
  checkIssue,
  resolveGithubToken,
  resolveRepository,
} from "#tools/github/index";
import { defineCommand } from "#workflows/cli/operations/defineCommand";

export const issues = defineCommand((command) => {
  command
    .command("check")
    .description(
      "Check that an issue meets the issue contract; exit 1 with one line per finding otherwise.",
    )
    .argument("<number>", "issue number", Number)
    .option("--repo <owner/repo>", "repository, else package.json or origin")
    .addOption(
      new Option("--for <role>", "who the issue is checked for")
        .choices(["worker", "debugger"] as const)
        .default("worker" as const),
    )
    .action(async (number, { repo, for: audience }) => {
      const findings = await checkIssue(
        {
          repository: await resolveRepository(process.cwd(), repo),
          token: await resolveGithubToken(),
        },
        number,
        audience,
      );

      if (findings.length === 0) {
        return void console.log(`#${number} ready`);
      }

      for (const { message } of findings) {
        console.log(`#${number} ${message}`);
      }

      process.exitCode = 1;
    });

  return command;
});
