import { readFileSync } from "node:fs";

import { literal, object, string } from "valibot";

import { validate } from "#foundation/options/utils/validate";
import { reportBudgetFindings } from "#tools/agents/operations/reportBudgetFindings";
import { measureGithubCommand } from "#tools/agents/utils/measureGithubCommand";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

const payloadSchema = object({
  cwd: string(),
  tool_name: literal("Bash"),
  tool_input: object({
    command: string(),
  }),
});

export const github = defineCommand((command) => {
  return command
    .action(async () => {
      const {
        cwd,
        tool_input: { command: shellCommand },
      } = validate(
        payloadSchema,
        JSON.parse(readFileSync(0, "utf-8")),
        "Codex hook payload",
      );

      const { agents } = await loadConfig(cwd);
      const { budgets } = agents;
      const finding = measureGithubCommand(shellCommand, budgets);

      reportBudgetFindings(finding === undefined ? [] : [finding], {
        mode: budgets.mode,
        event: "PreToolUse",
      });
    });
});
