import { object, string } from "valibot";

import {
  agentsSection,
  denyToolUse,
  measureGithubCommand,
  readHookPayload,
  reportBudgetFindings,
} from "#tools/agents/index";
import { checkGithubWrite } from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  cwd: string(),
  tool_input: object({
    command: string(),
  }),
});

export default async function (): Promise<void> {
  const {
    cwd,
    tool_input: { command: shellCommand },
  } = await readHookPayload(payloadSchema, "Claude Code");

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
}
