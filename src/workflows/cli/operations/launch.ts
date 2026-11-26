import { createConsoleReporter } from "#foundation/reports/index";
import { formatCommandError, isDebugEnvironment } from "#nexus/cli/index";
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

    createConsoleReporter().error(
      formatCommandError(error, {
        debug: isDebugEnvironment(debugEnvironmentVariable),
        debugVariable: debugEnvironmentVariable,
        explanation,
      }),
    );

    process.exitCode = 1;
  }
}
