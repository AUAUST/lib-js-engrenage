import { object, string } from "valibot";

import {
  denyToolUse,
  measureGithubCommand,
  readHookPayload,
  reportBudgetFindings,
} from "#tools/agents/index";
import { checkGithubWrite } from "#tools/github/index";
import { getRunContext } from "#workflows/cli/index";
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

  const config = await loadValidatedConfig(cwd, {
    reporter: getRunContext().reporter,
  });

  const {
    repositories,
    contract: contractNames,
  } = await config.resolve("github");

  const reason = await checkGithubWrite(
    shellCommand,
    cwd,
    repositories,
    contractNames,
  );

  if (reason !== undefined) {
    return void denyToolUse(reason);
  }

  const agents = await config.resolve("agents");

  const { budgets } = agents;

  reportBudgetFindings(measureGithubCommand(shellCommand, budgets), {
    mode: budgets.mode,
    event: "PreToolUse",
  });
}
