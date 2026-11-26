import { findSourceExecutable } from "#workflows/cli/operations/findSourceExecutable";
import { prepareLinkedRun } from "#workflows/cli/operations/prepareLinkedRun";

/**
 * Runs a bin executable: imports the linked checkout's executable when the
 * project in the working directory links another copy of its package, else its
 * source executable when the `source` condition is on, else calls `run`.
 *
 * @throws {Error} When the linked checkout lacks the running executable's file.
 */
export async function runExecutable(
  executable: { url: string; resolve(specifier: string): string },
  sourceSpecifier: string,
  run: () => Promise<void>,
): Promise<void> {
  const deferred = (
    (await prepareLinkedRun(executable.url)) ??
    (await findSourceExecutable(executable, sourceSpecifier))
  );

  if (deferred === undefined) {
    await run();
  } else {
    await import(deferred);
  }
}
