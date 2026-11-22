import { object, string } from "valibot";

import { denyToolUse } from "#metalbrain/runtimes/index";
import { findShellTrap, validateHookPayload } from "#tools/agents/index";

const payloadSchema = object({
  tool_input: object({
    command: string(),
  }),
});

export default function (payload: unknown): Promise<boolean> {
  const {
    tool_input: { command },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const trap = findShellTrap(command);

  if (trap !== undefined) {
    denyToolUse(trap);
  }

  return Promise.resolve(trap !== undefined);
}
