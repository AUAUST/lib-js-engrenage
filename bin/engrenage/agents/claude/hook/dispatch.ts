import { object, optional, string } from "valibot";

import { checkAgentDispatch } from "#tools/agents/operations/checkAgentDispatch";
import { denyToolUse } from "#tools/agents/operations/denyToolUse";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { defineCommand } from "#workflows/cli/operations/defineCommand";

const payloadSchema = object({
  tool_input: object({
    subagent_type: optional(string()),
    prompt: optional(string(), ""),
  }),
});

export const dispatch = defineCommand((command) => {
  return command.action(async () => {
    const {
      tool_input: { subagent_type: agent = "", prompt },
    } = await readHookPayload(payloadSchema, "Claude Code");

    const reason = await checkAgentDispatch(agent, prompt);

    if (reason !== undefined) {
      denyToolUse(reason);
    }
  });
});
