import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Report every issue of the tree from an issue down, each parent above its sub-issues, with its state counting local `Closes` commits, Blockers, findings, open **Planning** and **Questions** and local commits, then the ready set, every issue actionable in turn, and the next one; exit 1 when the ready set is empty.",
      )
      .argument("<number>", "issue number", Number)
      .option(
        "--repo <repo>",
        "repository as `owner/repo` or a registered short name, else package.json or origin",
      );
  },
  action() {
    return import("#bin/engrenage/planning/walk/actions/check");
  },
});
