import { join } from "@auaust/toolkit/array";

/**
 * Runs `task`, recording how long it took in the performance timeline as a
 * measure named after `path` below `gate`, each part behind a colon, so a run's
 * timings nest it under its parent.
 *
 * @returns What `task` resolves to, with its duration in milliseconds.
 */
export async function measureGateTask<Result>(
  path: readonly string[],
  task: () => Promise<Result>,
): Promise<{ result: Result; duration: number }> {
  const name = join(["gate", ...path], ":");
  const start = performance.now();

  function measure() {
    const end = performance.now();

    performance.measure(name, { start, end });

    return end - start;
  }

  let result: Result;

  try {
    result = await task();
  } catch (error) {
    measure();

    throw error;
  }

  return { result, duration: measure() };
}
