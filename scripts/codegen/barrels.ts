import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Fill the engrenage blocks of the barrels with re-exports of the modules they name.",
      )
      .argument(
        "[barrels...]",
        "barrels to sync, by directory name (all by default)",
      )
      .option("--check", "report outdated barrels without writing them", false);
  },
  action() {
    return import("#scripts/codegen/actions/barrels");
  },
});
