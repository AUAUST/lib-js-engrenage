import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "For each issue number, write `.ai/issues/<n>.md` with the manifest and body as fetched and `.ai/issues/<n>.draft.md` with its manifest and body, then add `Drafting` to its Blockers; fails when a draft exists already.",
      )
      .argument(
        "<refs>",
        "comma-separated issue numbers, such as `123,124`",
        (value) => {
          return value
            .split(",")
            .map((stem) => stem.trim())
            .filter((stem) => stem !== "");
        },
      );
  },
  action() {
    return import("#bin/engrenage/planning/issue/actions/claim");
  },
});
