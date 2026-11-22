import { text } from "node:stream/consumers";

import {
  denyToolUse,
  resolveMainWorktree,
  writeHookContext,
  type HookEvent,
  type HookVerdict,
  type HostChecks,
} from "#metalbrain/runtimes/index";

function writeVerdict(verdict: HookVerdict, event: HookEvent) {
  if (verdict.decision === "context") {
    return void writeHookContext({
      event,
      context: verdict.context,
      notify: verdict.notify === true,
    });
  }

  if (event !== "PreToolUse") {
    throw new Error(
      `metalbrain renders no Claude Code ${event} denial: ${verdict.reason}`,
    );
  }

  denyToolUse(verdict.reason);
}

export default async function (
  check: keyof HostChecks,
  event: HookEvent,
): Promise<void> {
  const time = Date.now();

  const payload: unknown = JSON.parse(await text(process.stdin));

  const {
    claudeHostChecks,
  } = await import("#tools/metalbrain/adapters/claudeHostChecks");

  const verdict = await claudeHostChecks[check](payload, {
    root: await resolveMainWorktree(process.cwd()),
    time,
  });

  if (verdict !== undefined) {
    writeVerdict(verdict, event);
  }
}
