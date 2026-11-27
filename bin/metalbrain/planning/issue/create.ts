import { argument, command, option } from "#nexus/cli/index";

export default command({
  name: "create",
  description: "Write `.ai/issues/new-<slug>.draft.md`, or `<repo>.new-<slug>.draft.md` with --repo, with the type's manifest, each option listed as a comment, and its contract's body skeleton; with --parent, list it in the parent draft's `subIssues`.",
  arguments: [
    argument({
      name: "type",
      description: "the issue type's meaning or GitHub name, in any case, such as `task` or `Task`",
    }),
  ],
  options: [
    option({
      name: "slug",
      type: "string",
      placeholder: "slug",
      description: "a slug, with or without the `new-` prefix; defaults to `<type>-<k>` with the first free `k`",
    }),
    option({
      name: "repo",
      type: "string",
      placeholder: "repo",
      description: "registered short name of the repository to create the issue in; defaults to the current one",
    }),
    option({
      name: "parent",
      type: "string",
      placeholder: "ref",
      description: "the parent: a reference (`#123`, `#{new-plan}`, `#{toolkit.new-plan}`), a draft stem (`123`, `new-plan`) or a new draft's slug (`plan`)",
    }),
    option({
      name: "after",
      type: "string",
      placeholder: "ref",
      description: "sibling in the parent's `subIssues` to place it after, as a reference (`#123`, `#{new-plan}`, `#{toolkit.new-plan}`), a draft stem (`123`, `new-plan`) or a new draft's slug (`plan`); defaults to last",
    }),
  ],
  action() {
    return import("#bin/metalbrain/planning/issue/actions/create");
  },
});
