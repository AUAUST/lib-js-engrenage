// @debt generic check reporting the record core owns only because `tools/agents`, its other user, sits above it; a support module below both would own it
/**
 * Lists `violations` under `heading`, one `- ` line each.
 *
 * @throws {Error} When `violations` is not empty.
 */
export function throwViolations(
  heading: string,
  violations: readonly string[],
): void {
  if (violations.length > 0) {
    throw new Error(
      [heading, ...violations.map((violation) => `- ${violation}`)].join("\n"),
    );
  }
}
