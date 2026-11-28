import {
  isDebugEnvironment,
  program,
  reportCommandError,
  toDebugVariable,
  type CommandDeclaration,
  type ProgramLaunch,
  type RunFailure,
} from "#nexus/cli/index";
import { createReporter, filterReports } from "#nexus/reports/index";
import { detectPrinter } from "#nexus/scenarios/index";
import { explainStaleBarrel, resolveConfiguredDebug } from "#tools/nexus/index";
import { prepareLinkedRun } from "#workflows/cli/operations/prepareLinkedRun";

async function reportStaleBarrel(
  name: string,
  error: unknown,
  explanation: string,
): Promise<void> {
  const debugVariable = toDebugVariable(name);

  const debug = isDebugEnvironment(debugVariable);

  const printer = await detectPrinter();

  reportCommandError(error, {
    reporter: createReporter(
      filterReports(printer, () => {
        return debug ? "debug" : "default";
      }),
    ),
    debug,
    debugVariable,
    explanation,
  });

  process.exitCode = 1;
}

// @debt takes the program's name apart from its root declaration's, since a stale barrel can keep that declaration from loading
/**
 * Loads the engrenage program named `name` for nexus's `launch`: imports the
 * linked checkout's executable instead when the project in the working directory
 * links another copy of its package, else declares the program over the root
 * `load` resolves to, run with its failure handler, the `debug` config key and
 * the hand fix of a stale barrel leading its error. A stale barrel keeping it
 * from loading is reported with its hand fix, its stack shown when the program's
 * debug variable is on.
 *
 * @returns The program to launch, or `undefined` once the run is over.
 * @throws {Error} When the linked checkout's build is older than its sources or
 * lacks the running executable's file.
 * @throws {unknown} What `load` throws other than a stale barrel.
 */
export async function loadEngrenageProgram(
  name: string,
  executableUrl: string,
  load: () => Promise<{
    root: CommandDeclaration;
    onError?(error: unknown, failure: RunFailure): Promise<void> | void;
  }>,
): Promise<ProgramLaunch | undefined> {
  try {
    const deferred = await prepareLinkedRun(executableUrl);

    if (deferred !== undefined) {
      return void (await import(deferred));
    }

    const { root, ...settings } = await load();

    return {
      ...settings,
      program: program({ root }),
      resolveDebug: resolveConfiguredDebug,
      explain: explainStaleBarrel,
    };
  } catch (error) {
    const explanation = explainStaleBarrel(error);

    if (explanation === undefined) {
      throw error;
    }

    await reportStaleBarrel(name, error, explanation);
  }
}
