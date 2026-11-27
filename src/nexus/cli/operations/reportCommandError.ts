import { join } from "@auaust/toolkit/array";

import { stackEntry, type Reporter } from "#nexus/reports/index";

function describe(value: unknown): string {
  return value instanceof Error ? value.message : String(value);
}

/**
 * Reports a failed run's error with its causes, led by `explanation` when one is
 * given, and followed by how to print its stack unless `debug` is on; its stack
 * goes to the reporter's debug level.
 */
export function reportCommandError(
  error: unknown,
  {
    reporter,
    debug,
    debugVariable,
    explanation,
  }: {
    reporter: Reporter;
    debug: boolean;
    debugVariable: string;
    explanation?: string | undefined;
  },
): void {
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
      `Run with --debug or set ${debugVariable}=1 to print the stack trace`,
    );
  }

  reporter.error(join(lines, "\n"));

  if (error instanceof Error && error.stack !== undefined) {
    reporter.debug(stackEntry(error.stack));
  }
}
