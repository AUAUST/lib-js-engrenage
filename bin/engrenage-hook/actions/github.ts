import { object, string } from "valibot";

import {
  denyToolUse,
  measureGithubCommand,
  reportBudgetFindings,
  resolveHookDirectory,
  validateHookPayload,
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

export default async function (
  payload: unknown,
  runtime: "Claude Code" | "Codex",
): Promise<boolean> {
  const {
    cwd,
    tool_input: { command: shellCommand },
  } = validateHookPayload(payloadSchema, payload, runtime);

  const config = await loadValidatedConfig(resolveHookDirectory(cwd), {
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
    denyToolUse(reason);

    return true;
  }

  const { budgets } = await config.resolve("agents");

  const findings = measureGithubCommand(shellCommand, budgets);

  reportBudgetFindings(findings, {
    mode: budgets.mode,
    event: "PreToolUse",
  });

  return findings.length > 0;
}
