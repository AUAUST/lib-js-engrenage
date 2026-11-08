import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Generate the typed ESLint rules interfaces from the plugins the shipped configuration registers.",
      )
      .option("--check", "report outdated files without writing them", false);
  },
  action() {
    return import("#scripts/codegen/actions/rules");
  },
});
