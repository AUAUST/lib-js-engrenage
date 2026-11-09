import { literal, object, string } from "valibot";

import {
  denyToolUse,
  measureGithubCommand,
  readHookPayload,
  reportBudgetFindings,
} from "#tools/agents/index";
import { checkGithubWrite } from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  cwd: string(),
  tool_name: literal("Bash"),
  tool_input: object({
    command: string(),
  }),
});

// @debt repeats the Claude `github` hook action except for its payload schema and runtime name, instead of one action owning both
export default async function (): Promise<void> {
  const {
    cwd,
    tool_input: { command: shellCommand },
  } = await readHookPayload(payloadSchema, "Codex");

  const reason = await checkGithubWrite(shellCommand, cwd);

  if (reason !== undefined) {
    return void denyToolUse(reason);
  }

  const config = await loadValidatedConfig(cwd);

  const agents = await config.resolve("agents");

  const { budgets } = agents;

  reportBudgetFindings(measureGithubCommand(shellCommand, budgets), {
    mode: budgets.mode,
    event: "PreToolUse",
  });
}
