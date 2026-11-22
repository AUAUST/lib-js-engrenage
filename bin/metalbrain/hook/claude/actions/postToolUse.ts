import { text } from "node:stream/consumers";

import {
  logToolCall,
  parseToolPayload,
  resolveMainWorktree,
} from "#metalbrain/runtimes/index";

export default async function (): Promise<void> {
  const time = Date.now();

  const payload = parseToolPayload(JSON.parse(await text(process.stdin)));

  await logToolCall(payload, {
    root: await resolveMainWorktree(process.cwd()),
    time,
  });
}
