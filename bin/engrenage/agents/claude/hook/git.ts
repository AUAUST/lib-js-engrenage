import { object, string } from "valibot";

import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { findHookBypass } from "#tools/git/utils/findHookBypass";
import { defineCommand } from "#workflows/cli/operations/defineCommand";

const payloadSchema = object({
  tool_input: object({
    command: string(),
  }),
});

export const git = defineCommand((command) => {
  return command.action(async () => {
    const {
      tool_input: { command: shellCommand },
    } = await readHookPayload(payloadSchema, "Claude Code");

    const bypass = findHookBypass(shellCommand);

    if (bypass === undefined) {
      return;
    }

    process.stdout.write(
      `${JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: `agent commits go through the gate; fix what it reports instead of skipping it (${bypass})`,
        },
      })}\n`,
    );
  });
});
