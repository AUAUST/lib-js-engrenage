import { object, string } from "valibot";

import { agentsSection } from "#tools/agents/index";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { reportBudgetFindings } from "#tools/agents/operations/reportBudgetFindings";
import { measureGithubCommand } from "#tools/agents/utils/measureGithubCommand";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

const payloadSchema = object({
  tool_input: object({
    command: string(),
  }),
});

export const github = defineCommand((command) => {
  return command.action(async () => {
    const {
      tool_input: { command: shellCommand },
    } = await readHookPayload(payloadSchema, "Claude Code");

    const config = await loadConfig();
    const agents = await config.resolve(agentsSection);
    const { budgets } = agents;
    const finding = measureGithubCommand(shellCommand, budgets);

    reportBudgetFindings(finding === undefined ? [] : [finding], {
      mode: budgets.mode,
      event: "PreToolUse",
    });
  });
});
