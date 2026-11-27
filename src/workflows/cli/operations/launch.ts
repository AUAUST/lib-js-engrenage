import { isDebugEnvironment, reportCommandError } from "#nexus/cli/index";
import { createReporter, filterReports } from "#nexus/reports/index";
import { detectPrinter } from "#nexus/scenarios/index";
import { debugEnvironmentVariable } from "#tools/nexus/constants";
import { explainStaleBarrel } from "#tools/nexus/index";

export async function launch(run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch (error) {
    const explanation = explainStaleBarrel(error);

    if (explanation === undefined) {
      throw error;
    }

    const debug = isDebugEnvironment(debugEnvironmentVariable);

    const printer = await detectPrinter();

    reportCommandError(error, {
      reporter: createReporter(
        filterReports(printer, () => {
          return debug ? "debug" : "default";
        }),
      ),
      debug,
      debugVariable: debugEnvironmentVariable,
      explanation,
    });

    process.exitCode = 1;
  }
}
