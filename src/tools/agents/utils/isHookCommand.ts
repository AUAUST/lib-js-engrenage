export function isHookCommand(argv: readonly string[]): boolean {
  const agents = argv.indexOf("agents");

  return (
    agents !== -1 &&
    (argv[agents + 1] === "claude" || argv[agents + 1] === "codex") &&
    argv[agents + 2] === "hook"
  );
}
