import { contextEvents } from "#metalbrain/runtimes/hooks/constants";
import type { FailOpenOutput } from "#metalbrain/runtimes/types/FailOpenOutput";

/**
 * The Claude Code hook output failing open the hook `command` runs, the words
 * of its command line, on `error`: its failure as the `systemMessage`, also as
 * `additionalContext` when `command` names an event accepting it.
 */
export function toFailOpenOutput(
  command: readonly string[],
  error: unknown,
): FailOpenOutput {
  const reason = error instanceof Error ? error.message : String(error);

  const message = `${command.join(" ")} did not run, so its checks are off: ${reason}`;

  const event = command.find((word) => {
    return contextEvents.includes(word);
  });

  return {
    systemMessage: message,
    ...(event === undefined
      ? {}
      : {
          hookSpecificOutput: {
            hookEventName: event,
            additionalContext: message,
          },
        }),
  };
}
