import { object, string } from "valibot";

import { denyToolUse } from "#tools/agents/operations/denyToolUse";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { findHookBypass } from "#tools/git/utils/findHookBypass";
import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";

const payloadSchema = object({
  tool_input: object({
    command: string(),
  }),
});

export const git = defineLegacyCommand((command) => {
  return command.action(async () => {
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
  });
});
