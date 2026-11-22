import { text } from "node:stream/consumers";

import {
  parseToolPayload,
  recordCallStart,
  resolveMainWorktree,
} from "#metalbrain/runtimes/index";

export default async function (): Promise<void> {
  const time = Date.now();

  const payload = parseToolPayload(JSON.parse(await text(process.stdin)));

  await recordCallStart(payload, {
    root: await resolveMainWorktree(process.cwd()),
    time,
  });
}
