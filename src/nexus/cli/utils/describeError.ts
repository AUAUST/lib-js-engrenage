import { join } from "@auaust/toolkit/array";

function describe(value: unknown): string {
  return value instanceof Error ? value.message : String(value);
}

/**
 * The message of `error`, followed by a `Caused by:` line for each of its
 * causes, each cause once.
 */
export function describeError(error: unknown): string {
  const lines = [describe(error)];
  const seen = new Set<unknown>([error]);

  for (
    let cause = error instanceof Error ? error.cause : undefined;
    cause !== undefined && !seen.has(cause);
    cause = cause instanceof Error ? cause.cause : undefined
  ) {
    seen.add(cause);
    lines.push(`Caused by: ${describe(cause)}`);
  }

  return join(lines, "\n");
}
