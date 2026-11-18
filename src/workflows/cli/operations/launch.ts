import { detectHookCommand } from "#workflows/cli/operations/detectHookCommand";
import { explainStaleBarrel } from "#workflows/cli/operations/explainStaleBarrel";
import { formatCommandError } from "#workflows/cli/operations/formatCommandError";
import { isDebugEnvironment } from "#workflows/cli/operations/isDebugEnvironment";

export async function launch(
  run: () => Promise<void>,
  argv: readonly string[] = process.argv,
): Promise<void> {
  try {
    await run();
  } catch (error) {
    const explanation = explainStaleBarrel(error);

    const kind = await detectHookCommand(argv);

    if (kind === "hook") {
      const reason = (
        explanation ?? (error instanceof Error ? error.message : String(error))
      );

      console.error(
        `engrenage cannot load: ${reason}; this check fails until it runs`,
      );

      process.exitCode = 2;

      return;
    }

    if (kind === "command" && explanation === undefined) {
      throw error;
    }

    console.error(formatCommandError(error, { debug: isDebugEnvironment() }));

    process.exitCode = kind === "unknown" ? 2 : 1;
  }
}
