import { collectListArgument, defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "For each issue number, write `.ai/issues/<n>.md` with the manifest and body as fetched and `.ai/issues/<n>.draft.md` with its manifest and body, then add `Drafting` to its Blockers; fails when a draft exists already.",
      )
      .argument(
        "<refs...>",
        "issue numbers, comma- or space-separated, such as `123,124` or `123 124`",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/engrenage/planning/issue/actions/claim");
  },
});
