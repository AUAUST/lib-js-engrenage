import { text } from "node:stream/consumers";

import {
  checkBudget,
  isBudgetLevel,
  parseToolPayload,
} from "#metalbrain/runtimes/index";

export default async function ({ level }: { level: string }): Promise<void> {
  if (!isBudgetLevel(level)) {
    throw new Error(`Unknown budget level: ${level}`);
  }

  const time = Date.now();

  const payload = parseToolPayload(JSON.parse(await text(process.stdin)));

  const context = await checkBudget(level)(payload, {
    root: process.cwd(),
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
