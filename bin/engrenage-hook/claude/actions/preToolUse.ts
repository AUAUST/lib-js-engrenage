import { text } from "node:stream/consumers";

import { looseObject, optional, parse, string } from "valibot";

// @debt repeats the Codex router's payload schema and stdin read, which each router keeps to import nothing but node: modules and valibot
const payloadSchema = looseObject({
  tool_name: string(),
  tool_input: looseObject({
    command: optional(string()),
  }),
});

async function checkBash(payload: unknown, command: string): Promise<void> {
  if (/\bgit\b/.test(command)) {
    const {
      default: git,
    } = await import("#bin/engrenage-hook/claude/actions/git");

    if (await git(payload)) {
      return;
    }
  }

  if (!/\bgh\b/.test(command) || !/\bissue\b/.test(command)) {
    return;
  }

  const {
    default: github,
  } = await import("#bin/engrenage-hook/actions/github");

  await github(payload, "Claude Code");
}

export default async function (): Promise<void> {
  const payload = parse(payloadSchema, JSON.parse(await text(process.stdin)));

  const tool = payload.tool_name;

  if (tool === "Bash") {
    return checkBash(payload, payload.tool_input.command ?? "");
  }

  if (tool === "Agent" || tool === "Task") {
    const {
      default: dispatch,
    } = await import("#bin/engrenage-hook/claude/actions/dispatch");

    await dispatch(payload);

    return;
  }

  if (tool !== "SendMessage") {
    return;
  }

  const {
    default: resume,
  } = await import("#bin/engrenage-hook/claude/actions/resume");

  await resume(payload);
}
