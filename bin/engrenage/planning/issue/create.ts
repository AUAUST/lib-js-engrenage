import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Write `.ai/issues/new-<slug>.draft.md`, or `<repo>.new-<slug>.draft.md` with --repo, with the type's manifest, each option listed as a comment, and its contract's body skeleton; with --parent, list it in the parent draft's `subIssues`.",
      )
      .argument("<type>", "the issue type's meaning, such as `task`")
      .option(
        "--slug <slug>",
        "draft slug; defaults to `<type>-<k>` with the first free `k`",
      )
      .option(
        "--repo <repo>",
        "registered short name of the repository to create the issue in; defaults to the current one",
      )
      .option(
        "--parent <ref>",
        "draft file stem of the parent, such as `new-plan` or `123`",
      )
      .option(
        "--after <ref>",
        "sibling in the parent's `subIssues` to place it after; defaults to last",
      );
  },
  action() {
    return import("#bin/engrenage/planning/issue/actions/create");
  },
});
