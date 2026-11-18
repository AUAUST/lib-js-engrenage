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
