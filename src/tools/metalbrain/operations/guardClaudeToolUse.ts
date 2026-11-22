import { looseObject, optional, parse, string } from "valibot";

import type { HookVerdict } from "#metalbrain/runtimes/index";

const payloadSchema = looseObject({
  tool_name: string(),
  tool_input: looseObject({
    command: optional(string()),
  }),
});

async function guardBash(
  payload: unknown,
  command: string,
): Promise<HookVerdict | undefined> {
  if (/\bgit\b/.test(command)) {
    const {
      guardClaudeGit,
    } = await import("#tools/metalbrain/operations/guardClaudeGit");

    const verdict = guardClaudeGit(payload);

    if (verdict !== undefined) {
      return verdict;
    }
  }

  if (/(?:^|[\s;&|(])=|\bsed\b|\btimeout\b|eslint:fix/.test(command)) {
    const {
      guardClaudeShell,
    } = await import("#tools/metalbrain/operations/guardClaudeShell");

    const verdict = guardClaudeShell(payload);

    if (verdict !== undefined) {
      return verdict;
    }
  }

  if (!/\bgh\b/.test(command) || !/\bissue\b/.test(command)) {
    return;
  }

  const {
    guardClaudeGithub,
  } = await import("#tools/metalbrain/operations/guardClaudeGithub");

  return guardClaudeGithub(payload);
}

/**
 * PreToolUse on Bash, Agent, Task and SendMessage: runs the guards the tool
 * call needs, each loaded only when its tool or command calls it, and returns
 * the first denial or notice.
 */
export async function guardClaudeToolUse(
  payload: unknown,
): Promise<HookVerdict | undefined> {
  const {
    tool_name: tool,
    tool_input: { command = "" },
  } = parse(payloadSchema, payload);

  if (tool === "Bash") {
    return guardBash(payload, command);
  }

  if (tool === "Agent" || tool === "Task") {
    const {
      guardClaudeDispatch,
    } = await import("#tools/metalbrain/operations/guardClaudeDispatch");

    return guardClaudeDispatch(payload);
  }

  if (tool !== "SendMessage") {
    return;
  }

  const {
    guardClaudeResume,
  } = await import("#tools/metalbrain/operations/guardClaudeResume");

  return guardClaudeResume(payload);
}
