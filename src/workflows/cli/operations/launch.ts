import { createConsoleReporter } from "#foundation/reports/index";
import { explainStaleBarrel } from "#workflows/cli/operations/explainStaleBarrel";
import { formatCommandError } from "#workflows/cli/operations/formatCommandError";
import { isDebugEnvironment } from "#workflows/cli/operations/isDebugEnvironment";

export async function launch(run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch (error) {
    if (explainStaleBarrel(error) === undefined) {
      throw error;
    }

    createConsoleReporter().error(
      formatCommandError(error, { debug: isDebugEnvironment() }),
    );

    process.exitCode = 1;
  }
}
