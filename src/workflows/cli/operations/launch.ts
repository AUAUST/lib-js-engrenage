import {
  isDebugEnvironment,
  reportCommandError,
  toDebugVariable,
} from "#nexus/cli/index";
import { createReporter, filterReports } from "#nexus/reports/index";
import { detectPrinter } from "#nexus/scenarios/index";
import { explainStaleBarrel } from "#tools/nexus/index";

// @debt takes the program's name apart from its root declaration's, since a stale barrel can keep that declaration from loading
/**
 * Runs `run`, launching the program named `program`, and reports a stale
 * barrel it fails on with its hand fix, its stack shown when the program's
 * debug variable is on.
 *
 * @throws {unknown} What `run` throws other than a stale barrel.
 */
export async function launch(
  program: string,
  run: () => Promise<void>,
): Promise<void> {
  try {
    await run();
  } catch (error) {
    const explanation = explainStaleBarrel(error);

    if (explanation === undefined) {
      throw error;
    }

    const debugVariable = toDebugVariable(program);

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
}
