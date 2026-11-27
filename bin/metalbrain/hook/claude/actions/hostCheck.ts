import { text } from "node:stream/consumers";

import {
  resolveMainWorktree,
  toHookOutput,
} from "#metalbrain/runtimes/hooks/index";
import { getRunContext } from "#nexus/cli/index";
import { dataEntry, lineEntry } from "#nexus/reports/index";
import type {
  HookEvent,
  HostCheck,
  HostChecks,
} from "#metalbrain/runtimes/index";

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

  if (verdict === undefined) {
    return;
  }

  getRunContext().reporter.log(
    dataEntry(toHookOutput(verdict, event), [
      lineEntry(
        verdict.decision === "context" ? verdict.context : verdict.reason,
      ),
    ]),
  );
}
