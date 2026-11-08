import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Move the project to the latest pnpm within engrenage's pnpm range.",
      )
      .option(
        "-y, --yes",
        "accept moving a newer pnpm back into the range",
        false,
      );
  },
  action() {
    return import("#bin/engrenage/pnpm/actions/upgrade");
  },
});
