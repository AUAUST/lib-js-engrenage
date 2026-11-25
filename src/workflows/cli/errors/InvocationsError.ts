import type { InvocationFailure } from "#workflows/cli/types/InvocationFailure";

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class InvocationsError extends AggregateError {
  readonly failures: readonly InvocationFailure[];

  constructor(failures: readonly InvocationFailure[], count: number) {
    super(
      failures.map(({ error }) => error),
      [
        `${failures.length} of ${count} invocations failed, so none took effect:`,
        ...failures.map(({ position, error }) => {
          return `invocation ${position}: ${describe(error)}`;
        }),
      ].join("\n"),
    );

    this.name = "InvocationsError";
    this.failures = failures;
  }
}
