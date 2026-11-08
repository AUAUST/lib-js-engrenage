export async function launch(
  run: () => Promise<void>,
  argv: readonly string[] = process.argv,
): Promise<void> {
  try {
    await run();
  } catch (error) {
    const { isHookCommand } = await import("#tools/agents/index");

    if (!isHookCommand(argv)) {
      throw error;
    }

    const reason = error instanceof Error ? error.message : String(error);

    console.error(
      `engrenage cannot load: ${reason}; this check fails until it runs`,
    );

    process.exitCode = 2;
  }
}
