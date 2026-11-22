import { text } from "node:stream/consumers";

import {
  checkThoroughness,
  isThoroughnessLevel,
  parseToolPayload,
  resolveMainWorktree,
} from "#metalbrain/runtimes/hooks/index";

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

  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
        additionalContext: context,
      },
    })}\n`,
  );
}
