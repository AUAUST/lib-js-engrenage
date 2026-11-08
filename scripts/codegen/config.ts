import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Generate `ConfigInput` and the documented config input interfaces from the descriptions of the config schemas.",
      )
      .option("--check", "report an outdated file without writing it", false);
  },
  action() {
    return import("#scripts/codegen/actions/config");
  },
});
