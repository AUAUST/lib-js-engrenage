import { join } from "@auaust/toolkit/array";

import { describeError } from "#nexus/cli/utils/describeError";
import { stackEntry, type Reporter } from "#nexus/reports/index";

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
  const described = describeError(error);

  const lines = explanation === undefined
    ? [described]
    : [explanation, `Caused by: ${described}`];

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
