import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("List the @debt markers of the project.")
      .option("--json", "print the markers as JSON", false);
  },
  action() {
    return import("#bin/engrenage/actions/debt");
  },
});
