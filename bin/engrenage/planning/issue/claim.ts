import { collectListArgument, defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "For each published issue, write `.ai/issues/<ref>.md` with the manifest and body as fetched and `.ai/issues/<ref>.draft.md` with its manifest and body, then add `Drafting` to its Blockers when it belongs to the current repository; fails when a draft exists already.",
      )
      .argument(
        "<refs...>",
        "issue numbers of the current repository or `<repo>.<n>` of a registered repository, comma- or space-separated, such as `123,toolkit.124` or `123 toolkit.124`",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/engrenage/planning/issue/actions/claim");
  },
});
