import { InvocationsError } from "#workflows/cli/errors/InvocationsError";
import type { InvocationFailure } from "#workflows/cli/types/InvocationFailure";

/**
 * Runs `run` on each invocation of a chained command in order, running every
 * invocation even after one fails, so the caller commits their effects only
 * once this resolves.
 *
 * @returns The value each invocation's run resolves to, in order.
 * @throws {InvocationsError} When any of several invocations fails, naming each
 * failure by its position.
 * @throws {unknown} What `run` throws, when the chain holds one invocation.
 */
export async function runInvocations<Parameters extends unknown[], Result>(
  invocations: readonly Parameters[],
  run: (...parameters: Parameters) => Promise<Result>,
): Promise<Result[]> {
  const results: Result[] = [];

  const failures: InvocationFailure[] = [];

  for (const [index, parameters] of invocations.entries()) {
    try {
      results.push(await run(...parameters));
    } catch (error) {
      if (invocations.length === 1) {
        throw error;
      }

      failures.push({ position: index + 1, error });
    }
  }

  if (failures.length > 0) {
    throw new InvocationsError(failures, invocations.length);
  }

  return results;
}
