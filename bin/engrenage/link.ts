import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Link a registered repository's installed package to its local checkout without changing tracked files, or list the links with their state.",
      )
      .argument("[repository]", "registered short name of the repository")
      .argument("[directory]", "the repository's local checkout")
      .option(
        "--remove <repository>",
        "restore the installed package of a linked repository",
      )
      .option(
        "--restore",
        "repoint every recorded link at its checkout, after an install",
        false,
      );
  },
  action() {
    return import("#bin/engrenage/actions/link");
  },
});
