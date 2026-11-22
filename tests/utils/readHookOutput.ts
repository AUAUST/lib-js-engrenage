import { object, optional, parse, string } from "valibot";
import { expect } from "vitest";

const outputSchema = object({
  systemMessage: string(),
  hookSpecificOutput: optional(
    object({ hookEventName: string(), additionalContext: string() }),
  ),
});

/**
 * Parses the one line a hook failing open prints.
 */
export function readHookOutput(stdout: string) {
  const lines = stdout.trim().split("\n");

  expect(lines).toHaveLength(1);

  return parse(outputSchema, JSON.parse(lines[0] ?? ""));
}
