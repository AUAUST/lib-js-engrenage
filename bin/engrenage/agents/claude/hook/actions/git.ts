import { object, string } from "valibot";

import { ShellSyntaxError } from "#foundation/shell/index";
import { denyToolUse, readHookPayload } from "#tools/agents/index";
import { findHookBypass } from "#tools/git/index";

const payloadSchema = object({
  tool_input: object({
    command: string(),
  }),
});

export default async function (): Promise<void> {
  const {
    tool_input: { command: shellCommand },
  } = await readHookPayload(payloadSchema, "Claude Code");

  let bypass;

  try {
    bypass = findHookBypass(shellCommand);
  } catch (error) {
    if (!(error instanceof ShellSyntaxError)) {
      throw error;
    }

    denyToolUse(`the command is not valid shell: ${error.message}`);

    return;
  }

  if (bypass === undefined) {
    return;
  }

  denyToolUse(
    `agent commits go through the gate; fix what it reports instead of skipping it (${bypass})`,
  );
}
