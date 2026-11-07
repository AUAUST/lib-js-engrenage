import { isHookCommand } from "#tools/agents/utils/isHookCommand";

interface Program {
  run(): Promise<void>;
}

export async function launch(
  load: () => Promise<Program>,
  argv: readonly string[] = process.argv,
): Promise<void> {
  let program: Program;

  try {
    program = await load();

    await program.run();
  } catch (error) {
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
