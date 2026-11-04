import { join } from "@auaust/primitive-kit/arrays";

import { debugEnvironmentVariable } from "#config/constants";

function describe(value: unknown): string {
  return value instanceof Error ? value.message : String(value);
}

export function formatCommandError(
  error: unknown,
  { debug }: { debug: boolean },
): string {
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

  if (!debug) {
    lines.push(
      `Run with --debug or set ${debugEnvironmentVariable}=1 to print the stack trace`,
    );
  } else if (error instanceof Error && error.stack !== undefined) {
    lines.push(error.stack);
  }

  return join(lines, "\n");
}
