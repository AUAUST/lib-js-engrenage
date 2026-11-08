import { literal, object, string } from "valibot";

import { agentsSection, denyToolUse } from "#tools/agents/index";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { reportBudgetFindings } from "#tools/agents/operations/reportBudgetFindings";
import { measureGithubCommand } from "#tools/agents/utils/measureGithubCommand";
import { checkGithubWrite } from "#tools/github/index";
import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";

const payloadSchema = object({
  cwd: string(),
  tool_name: literal("Bash"),
  tool_input: object({
    command: string(),
  }),
});

export const github = defineLegacyCommand((command) => {
  return command.action(async () => {
    const {
      cwd,
      tool_input: { command: shellCommand },
    } = await readHookPayload(payloadSchema, "Codex");

    const reason = await checkGithubWrite(shellCommand, cwd);

    if (reason !== undefined) {
      return void denyToolUse(reason);
    }

    const config = await loadValidatedConfig(cwd);

    const agents = await config.resolve(agentsSection);

    const { budgets } = agents;

    reportBudgetFindings(measureGithubCommand(shellCommand, budgets), {
      mode: budgets.mode,
      event: "PreToolUse",
    });
  });
});
