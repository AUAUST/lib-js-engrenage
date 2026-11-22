import { text } from "node:stream/consumers";

import {
  blockStop,
  denyToolUse,
  resolveMainWorktree,
  writeHookContext,
  type HookEvent,
  type HookVerdict,
  type HostCheck,
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

  if (event === "PreToolUse") {
    return void denyToolUse(verdict.reason);
  }

  if (event === "Stop" || event === "SubagentStop") {
    return void blockStop(verdict.reason);
  }

  throw new Error(
    `metalbrain renders no Claude Code ${event} denial: ${verdict.reason}`,
  );
}

// @debt engrenage's host checks are composed in metalbrain's hook runner, because the gate runs in workflows/gate above tools/metalbrain's adapter; a host-provided check registry would keep the runner host-agnostic
async function loadHostCheck(check: keyof HostChecks): Promise<HostCheck> {
  if (check === "gateStop") {
    const { gateClaudeStop } = await import("#workflows/gate/index");

    return gateClaudeStop;
  }

  const {
    claudeHostChecks,
  } = await import("#tools/metalbrain/adapters/claudeHostChecks");

  return claudeHostChecks[check];
}

export default async function (
  check: keyof HostChecks,
  event: HookEvent,
): Promise<void> {
  const time = Date.now();

  const payload: unknown = JSON.parse(await text(process.stdin));

  const hostCheck = await loadHostCheck(check);

  const verdict = await hostCheck(payload, {
    root: await resolveMainWorktree(process.cwd()),
    time,
  });

  if (verdict !== undefined) {
    writeVerdict(verdict, event);
  }
}
