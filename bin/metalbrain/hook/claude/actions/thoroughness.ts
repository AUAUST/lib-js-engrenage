import { text } from "node:stream/consumers";

import {
  checkThoroughness,
  isThoroughnessLevel,
  parseToolPayload,
  resolveMainWorktree,
} from "#metalbrain/runtimes/hooks/index";
import { getRunContext } from "#nexus/cli/index";
import { dataEntry, lineEntry } from "#nexus/reports/index";

export default async function ({ level }: { level: string }): Promise<void> {
  if (!isThoroughnessLevel(level)) {
    throw new Error(`Unknown thoroughness level: ${level}`);
  }

  const time = Date.now();

  const payload = parseToolPayload(JSON.parse(await text(process.stdin)));

  const context = await checkThoroughness(level)(payload, {
    root: await resolveMainWorktree(process.cwd()),
    time,
  });

  if (context === undefined) {
    return;
  }

  // @debt states Claude Code's PreToolUse output beside `toHookOutput`, which renders no `allow` decision
  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      additionalContext: context,
    },
  };

  getRunContext().reporter.log(dataEntry(output, [lineEntry(context)]));
}
