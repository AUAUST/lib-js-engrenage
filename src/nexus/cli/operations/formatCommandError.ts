import { join } from "@auaust/toolkit/array";

function describe(value: unknown): string {
  return value instanceof Error ? value.message : String(value);
}

/**
 * Formats a failed run's error with its causes, led by `explanation` when
 * one is given, and with its stack only when `debug` is on, otherwise with
 * how to turn it on.
 */
export function formatCommandError(
  error: unknown,
  {
    debug,
    debugVariable,
    explanation,
  }: {
    debug: boolean;
    debugVariable?: string | undefined;
    explanation?: string | undefined;
  },
): string {
  const lines = explanation === undefined
    ? [describe(error)]
    : [explanation, `Caused by: ${describe(error)}`];

  const seen = new Set<unknown>([error]);

  for (
    let cause = error instanceof Error ? error.cause : undefined;
    cause !== undefined && !seen.has(cause);
    cause = cause instanceof Error ? cause.cause : undefined
  ) {
    seen.add(cause);
    lines.push(`Caused by: ${describe(cause)}`);
  }

  if (!debug) {
    lines.push(
      debugVariable === undefined
        ? "Run with --debug to print the stack trace"
        : `Run with --debug or set ${debugVariable}=1 to print the stack trace`,
    );
  } else if (error instanceof Error && error.stack !== undefined) {
    lines.push(error.stack);
  }

  return join(lines, "\n");
}
