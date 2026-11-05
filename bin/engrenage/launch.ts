interface Program {
  run(): Promise<void>;
}

function isHookCommand(argv: readonly string[]): boolean {
  const agents = argv.indexOf("agents");

  return agents !== -1 && argv[agents + 2] === "hook";
}

export async function launch(
  load: () => Promise<Program>,
  argv: readonly string[] = process.argv,
): Promise<void> {
  let program: Program;

  try {
    program = await load();
  } catch (error) {
    if (!isHookCommand(argv)) {
      throw error;
    }

    const reason = error instanceof Error ? error.message : String(error);

    console.error(
      `engrenage cannot load: ${reason}; this check fails until it runs`,
    );

    process.exitCode = 2;

    return;
  }

  await program.run();
}
