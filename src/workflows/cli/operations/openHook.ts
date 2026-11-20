// @debt names the Claude Code events accepting `additionalContext`, runtime knowledge the cli domain does not own
const contextEvents = new Set(["PreToolUse", "PostToolUse", "SubagentStart"]);

/**
 * Fails a hook program open: prints its failure as the hook's `systemMessage`,
 * also as `additionalContext` for events accepting it, and exits 0 so the
 * runtime carries on.
 */
export function openHook(program: string, error: unknown): void {
  const args = process.argv.slice(2);

  const reason = error instanceof Error ? error.message : String(error);

  const message = `${program} ${args.join(" ")} did not run, so its checks are off: ${reason}`;

  const event = args.find((arg) => {
    return contextEvents.has(arg);
  });

  process.stdout.write(
    `${JSON.stringify({
      systemMessage: message,
      ...(event === undefined
        ? {}
        : {
            hookSpecificOutput: {
              hookEventName: event,
              additionalContext: message,
            },
          }),
    })}\n`,
  );

  process.exitCode = 0;
}
