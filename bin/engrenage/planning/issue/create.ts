import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Write `.ai/issues/new-<slug>.draft.md`, or `<repo>.new-<slug>.draft.md` with --repo, with the type's manifest, each option listed as a comment, and its contract's body skeleton; with --parent, list it in the parent draft's `subIssues`.",
      )
      .argument(
        "<type>",
        "the issue type's meaning or GitHub name, in any case, such as `task` or `Task`",
      )
      .option(
        "--slug <slug>",
        "a slug, with or without the `new-` prefix; defaults to `<type>-<k>` with the first free `k`",
      )
      .option(
        "--repo <repo>",
        "registered short name of the repository to create the issue in; defaults to the current one",
      )
      .option(
        "--parent <ref>",
        "the parent: a reference (`#123`, `#{new-plan}`, `#{toolkit.new-plan}`) or a draft stem (`123`, `new-plan`)",
      )
      .option(
        "--after <ref>",
        "sibling in the parent's `subIssues` to place it after, as a reference (`#123`, `#{new-plan}`, `#{toolkit.new-plan}`) or a draft stem (`123`, `new-plan`); defaults to last",
      );
  },
  action() {
    return import("#bin/engrenage/planning/issue/actions/create");
  },
});
