import { object, string } from "valibot";

import {
  findShellTrap,
  validateHookPayload,
  type HookVerdict,
} from "#metalbrain/runtimes/index";

const payloadSchema = object({
  tool_input: object({
    command: string(),
  }),
});

/**
 * PreToolUse on Bash: denies a command falling into a zsh or macOS shell
 * trap, giving its fix.
 */
export function guardClaudeShell(payload: unknown): HookVerdict | undefined {
  const {
    tool_input: { command },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const trap = findShellTrap(command);

  return trap === undefined ? undefined : { decision: "deny", reason: trap };
}
