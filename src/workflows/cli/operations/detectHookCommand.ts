/**
 * Tells whether `argv` runs an agent hook command, loading the check lazily so
 * a failing load never fails the caller.
 *
 * @returns `"unknown"` when the check itself cannot load.
 */
export async function detectHookCommand(
  argv: readonly string[],
): Promise<"hook" | "command" | "unknown"> {
  try {
    const { isHookCommand } = await import("#tools/agents/index");

    return isHookCommand(argv) ? "hook" : "command";
  } catch {
    return "unknown";
  }
}
