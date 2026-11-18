import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Create and update the current repository's labels from `github.labels`, never deleting one.",
      )
      .option(
        "--check",
        "write nothing and exit non-zero on a missing, differing or extra label",
        false,
      );
  },
  action() {
    return import("#bin/engrenage/github/labels/actions/sync");
  },
});
