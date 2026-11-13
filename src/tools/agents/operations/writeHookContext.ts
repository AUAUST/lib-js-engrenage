import type { HookEvent } from "#tools/agents/types/HookEvent";

export function writeHookContext({
  event,
  context,
  notify = false,
}: {
  event: HookEvent;
  context: string;
  notify?: boolean;
}) {
  process.stdout.write(
    `${JSON.stringify({
      ...(notify ? { systemMessage: context } : {}),
      hookSpecificOutput: {
        hookEventName: event,
        additionalContext: context,
      },
    })}\n`,
  );
}
