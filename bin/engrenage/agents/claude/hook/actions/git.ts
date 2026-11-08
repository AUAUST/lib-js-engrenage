import { object, string } from "valibot";

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

  const bypass = findHookBypass(shellCommand);

  if (bypass === undefined) {
    return;
  }

  denyToolUse(
    `agent commits go through the gate; fix what it reports instead of skipping it (${bypass})`,
  );
}
