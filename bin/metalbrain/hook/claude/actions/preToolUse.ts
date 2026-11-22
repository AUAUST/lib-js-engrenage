import { text } from "node:stream/consumers";

import {
  parseToolPayload,
  recordCallStart,
  resolveMainWorktree,
} from "#metalbrain/runtimes/hooks/index";

export default async function (check?: "guardToolUse"): Promise<void> {
  if (check !== undefined) {
    const {
      default: hostCheck,
    } = await import("#bin/metalbrain/hook/claude/actions/hostCheck");

    return hostCheck(check, "PreToolUse");
  }

  const time = Date.now();

  const payload = parseToolPayload(JSON.parse(await text(process.stdin)));

  await recordCallStart(payload, {
    root: await resolveMainWorktree(process.cwd()),
    time,
  });
}
