import { object, string } from "valibot";

import { ShellSyntaxError } from "#foundation/shell/index";
import { validateHookPayload } from "#tools/agents/index";
import { findHookBypass } from "#tools/git/index";
import type { HookVerdict } from "#metalbrain/runtimes/index";

const payloadSchema = object({
  tool_input: object({
    command: string(),
  }),
});

function findDenial(command: string): string | undefined {
  let bypass;

  try {
    bypass = findHookBypass(command);
  } catch (error) {
    if (!(error instanceof ShellSyntaxError)) {
      throw error;
    }

    return `the command is not valid shell: ${error.message}`;
  }

  if (bypass !== undefined) {
    return `agent commits go through the gate; fix what it reports instead of skipping it (${bypass})`;
  }
}

/**
 * PreToolUse on Bash: denies a command that is not valid shell or bypasses
 * the commit gate.
 */
export function guardClaudeGit(payload: unknown): HookVerdict | undefined {
  const {
    tool_input: { command },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const reason = findDenial(command);

  return reason === undefined ? undefined : { decision: "deny", reason };
}
