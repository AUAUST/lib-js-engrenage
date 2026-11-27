import { phaseSeparator } from "#nexus/cli/constants";

interface PhaseSpan {
  readonly start: number;
  readonly duration: number;
}

/**
 * Creates a timer adding up the time spent in each phase across the stretches it
 * times, and recording in the performance timeline, once asked, one measure per
 * phase: starting with its first stretch, lasting their total, named after the
 * phase, behind `scope` and the phase separator when given.
 *
 * @pure
 */
export function createPhaseTimer(scope?: string) {
  const spans = new Map<string, PhaseSpan>();

  /** @observing */
  function add(phase: string, start: number) {
    const elapsed = performance.now() - start;
    const span = spans.get(phase);

    spans.set(
      phase,
      span === undefined
        ? { start, duration: elapsed }
        : { start: span.start, duration: span.duration + elapsed },
    );
  }

  /** @observing */
  function time<Result>(phase: string, task: () => Result): Result {
    const start = performance.now();

    try {
      return task();
    } finally {
      add(phase, start);
    }
  }

  /** @observing */
  async function timeAsync<Result>(
    phase: string,
    task: () => Promise<Result>,
  ): Promise<Result> {
    const start = performance.now();

    try {
      return await task();
    } finally {
      add(phase, start);
    }
  }

  /** @effectful */
  function measure() {
    for (const [phase, { start, duration }] of spans) {
      performance.measure(
        scope === undefined ? phase : `${scope}${phaseSeparator}${phase}`,
        { start, duration },
      );
    }

    spans.clear();
  }

  return {
    time,
    timeAsync,
    measure,
  };
}
