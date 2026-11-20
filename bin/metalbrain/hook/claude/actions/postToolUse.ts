import { text } from "node:stream/consumers";

import { logToolCall, parseToolPayload } from "#tools/agents/metalbrain/index";

export default async function (): Promise<void> {
  const time = Date.now();

  const payload = parseToolPayload(JSON.parse(await text(process.stdin)));

  await logToolCall(payload, { root: process.cwd(), time });
}
