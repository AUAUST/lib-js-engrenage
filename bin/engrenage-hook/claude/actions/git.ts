import { object, string } from "valibot";

import { ShellSyntaxError } from "#foundation/shell/index";
import { denyToolUse } from "#metalbrain/runtimes/index";
import { validateHookPayload } from "#tools/agents/index";
import { findHookBypass } from "#tools/git/index";

const payloadSchema = object({
  tool_input: object({
    command: string(),
  }),
});

function findDenial(payload: unknown): string | undefined {
  const {
    tool_input: { command: shellCommand },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  let bypass;

  try {
    bypass = findHookBypass(shellCommand);
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

export default function (payload: unknown): Promise<boolean> {
  const reason = findDenial(payload);

  if (reason !== undefined) {
    denyToolUse(reason);
  }

  return Promise.resolve(reason !== undefined);
}
