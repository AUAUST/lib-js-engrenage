import { constants, enableCompileCache } from "node:module";

import type { ProgramLaunch } from "#nexus/cli/launch/types/ProgramLaunch";

function shareCompileCache(): void {
  const { directory, status } = enableCompileCache();

  if (
    status === constants.compileCacheStatus.ENABLED &&
    directory !== undefined
  ) {
    process.env.NODE_COMPILE_CACHE = directory;
  }
}

/**
 * Runs the program `load` resolves to on the arguments of the running process,
 * with its run settings, as its executable module's only call. Unless
 * `compileCache` is `false`, it first enables Node's module compile cache and
 * hands its directory to the processes the run spawns, then loads the program and
 * nexus's run engine, so the cache covers them. `load` resolves to `undefined`
 * once it ran the process's work itself, such as by importing another executable.
 *
 * @effectful
 */
export async function launch(
  load: () => Promise<ProgramLaunch | undefined>,
  { compileCache = true }: { compileCache?: boolean } = {},
): Promise<void> {
  if (compileCache) {
    shareCompileCache();
  }

  const [
    launched,
    { runProgram },
  ] = await Promise.all([load(), import("#nexus/cli/operations/runProgram")]);

  if (launched === undefined) {
    return;
  }

  const { program, ...settings } = launched;

  await runProgram(program, undefined, settings);
}
