import { text } from "node:stream/consumers";

import {
  logToolCall,
  parseToolPayload,
  resolveMainWorktree,
} from "#metalbrain/runtimes/index";

export default async function (check?: "limitOutput"): Promise<void> {
  if (check !== undefined) {
    const {
      default: hostCheck,
    } = await import("#bin/metalbrain/hook/claude/actions/hostCheck");

    return hostCheck(check, "PostToolUse");
  }

  const time = Date.now();

  const payload = parseToolPayload(JSON.parse(await text(process.stdin)));

  await logToolCall(payload, {
    root: await resolveMainWorktree(process.cwd()),
    time,
  });
}
