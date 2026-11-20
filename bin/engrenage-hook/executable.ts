#!/usr/bin/env node

import { enableCompileCache } from "node:module";

const contextEvents = new Set([
  "SessionStart",
  "PreToolUse",
  "PostToolUse",
  "SubagentStart",
]);

function openHook(error: unknown) {
  const args = process.argv.slice(2);

  const reason = error instanceof Error ? error.message : String(error);

  const message = `engrenage-hook ${args.join(" ")} did not run, so its checks are off: ${reason}`;

  const event = args[1];

  process.stdout.write(
    `${JSON.stringify({
      systemMessage: message,
      ...(event !== undefined && contextEvents.has(event)
        ? {
            hookSpecificOutput: {
              hookEventName: event,
              additionalContext: message,
            },
          }
        : {}),
    })}\n`,
  );

  process.exitCode = 0;
}

enableCompileCache();

try {
  const {
    CommandUsageError,
    createProgram,
    runProgram,
  } = await import("#workflows/cli/index");

  const { default: hook } = await import("#bin/engrenage-hook/index");

  await runProgram(createProgram("engrenage-hook", hook), process.argv, {
    onError(error) {
      openHook(
        error instanceof CommandUsageError
          ? `${error.message}; regenerate the hooks with pnpm install, then pnpm engrenage sync`
          : error,
      );
    },
  });
} catch (error) {
  openHook(error);
}
