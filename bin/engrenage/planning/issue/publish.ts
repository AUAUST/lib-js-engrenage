import { collectListArgument, defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Validate the drafts as a set, merge each claimed issue with its GitHub changes since the claim, create the new issues, then set each issue's title, body, type, labels, fields, state, sub-issues and blocked-by relations, render Plan roadmaps, clear `Drafting`, print each issue's diff and delete its files. Exit 1 with one line per finding, before any write.",
      )
      .argument(
        "<refs...>",
        "draft file stems, comma- or space-separated, such as `123,new-foo` or `123 new-foo`",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/engrenage/planning/issue/actions/publish");
  },
});
