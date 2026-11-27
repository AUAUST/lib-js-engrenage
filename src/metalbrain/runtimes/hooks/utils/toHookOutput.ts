import type { HookEvent } from "#metalbrain/runtimes/types/HookEvent";
import type { HookVerdict } from "#metalbrain/runtimes/types/HookVerdict";

/**
 * The Claude Code hook output answering `event` with `verdict`.
 *
 * @throws {Error} When `verdict` denies an event Claude Code takes no denial for.
 */
export function toHookOutput(
  verdict: HookVerdict,
  event: HookEvent,
): Readonly<Record<string, unknown>> {
  if (verdict.decision === "context") {
    return {
      ...(verdict.notify === true ? { systemMessage: verdict.context } : {}),
      hookSpecificOutput: {
        hookEventName: event,
        additionalContext: verdict.context,
      },
    };
  }

  if (event === "PreToolUse") {
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: verdict.reason,
      },
    };
  }

  if (event === "Stop" || event === "SubagentStop") {
    return { decision: "block", reason: verdict.reason };
  }

  throw new Error(
    `metalbrain renders no Claude Code ${event} denial: ${verdict.reason}`,
  );
}
