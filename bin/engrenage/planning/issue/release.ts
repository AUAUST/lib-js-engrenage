import { collectListArgument, defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "For each issue number, remove `Drafting` from its Blockers, keeping its other options; fails when `.ai/issues/<n>.draft.md` exists.",
      )
      .argument(
        "<refs...>",
        "issue numbers, comma- or space-separated, such as `123,124` or `123 124`",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/engrenage/planning/issue/actions/release");
  },
});
