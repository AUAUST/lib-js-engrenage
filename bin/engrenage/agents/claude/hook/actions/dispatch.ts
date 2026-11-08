import { object, optional, string } from "valibot";

import {
  checkAgentDispatch,
  denyToolUse,
  readHookPayload,
} from "#tools/agents/index";

const payloadSchema = object({
  tool_input: object({
    subagent_type: optional(string()),
    prompt: optional(string(), ""),
  }),
});

export default async function (): Promise<void> {
  const {
    tool_input: { subagent_type: agent = "", prompt },
  } = await readHookPayload(payloadSchema, "Claude Code");

  const reason = await checkAgentDispatch(agent, prompt);

  if (reason !== undefined) {
    denyToolUse(reason);
  }
}
