import { prepareLinkedRun } from "#workflows/cli/operations/prepareLinkedRun";

/**
 * Runs a bin executable: imports the linked checkout's executable when the project
 * in the working directory links another copy of its package, else calls `run`.
 *
 * @throws {Error} When the linked checkout's build is older than its sources or
 * lacks the running executable's file.
 */
export async function runExecutable(
  executableUrl: string,
  run: () => Promise<void>,
): Promise<void> {
  const deferred = await prepareLinkedRun(executableUrl);

  if (deferred === undefined) {
    await run();
  } else {
    await import(deferred);
  }
}
