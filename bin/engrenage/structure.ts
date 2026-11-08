import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Print how engrenage classifies the project directories.")
      .option(
        "--check",
        "exit non-zero on an unclassified directory of a strict environment, a role cardinality violation, a module beside the command group of its name or a runtime import cycle",
        false,
      );
  },
  action() {
    return import("#bin/engrenage/actions/structure");
  },
});
