import { text } from "node:stream/consumers";

import { literal, object, string } from "valibot";

import { validate } from "#foundation/options/utils/validate";
import { agentsSection } from "#tools/agents/index";
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
  return command.action(async () => {
    const {
      cwd,
      tool_input: { command: shellCommand },
    } = validate(
      payloadSchema,
      JSON.parse(await text(process.stdin)),
      "Codex hook payload",
    );

    const config = await loadConfig(cwd);
    const agents = await config.resolve(agentsSection);
    const { budgets } = agents;
    const finding = measureGithubCommand(shellCommand, budgets);

    reportBudgetFindings(finding === undefined ? [] : [finding], {
      mode: budgets.mode,
      event: "PreToolUse",
    });
  });
});
