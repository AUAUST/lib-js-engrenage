import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Rewrite the backlog sites under a moved file or directory to its new path.",
      )
      .argument(
        "<old>",
        "the file's or directory's former path from the project root",
      )
      .argument("<new>", "its new path from the project root");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/relocate");
  },
});
