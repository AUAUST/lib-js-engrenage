import { text } from "node:stream/consumers";

import {
  resolveMainWorktree,
  type HostChecks,
} from "#metalbrain/runtimes/index";

export default async function (check: keyof HostChecks): Promise<void> {
  const time = Date.now();

  const payload: unknown = JSON.parse(await text(process.stdin));

  const {
    claudeHostChecks,
  } = await import("#tools/metalbrain/adapters/claudeHostChecks");

  await claudeHostChecks[check](payload, {
    root: await resolveMainWorktree(process.cwd()),
    time,
  });
}
