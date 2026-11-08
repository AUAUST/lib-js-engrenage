import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Set up engrenage in the project, or add the pieces it is missing.",
      )
      .option("-y, --yes", "accept every step without asking", false);
  },
  action() {
    return import("#bin/engrenage/actions/init");
  },
});
