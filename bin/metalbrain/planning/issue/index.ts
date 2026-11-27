import { argument, command, option } from "#nexus/cli/index";

export default command({
  name: "issue",
  description: "Create, claim, check and publish issue drafts, release stale claims, and check published issues.",
  subcommands: [
    command({
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
    }),
    command({
      name: "claim",
      description: "For each published issue, write `.ai/issues/<ref>.md` with the manifest and body as fetched and `.ai/issues/<ref>.draft.md` with its manifest and body, then add `Drafting` to its Blockers when it belongs to the current repository; fails when a draft exists already.",
      arguments: [
        argument({
          name: "refs",
          description: "issue numbers of the current repository or `<repo>.<n>` of a registered repository, such as `toolkit.124`",
          variadic: true,
          separator: ",",
        }),
      ],
      action() {
        return import("#bin/metalbrain/planning/issue/actions/claim");
      },
    }),
    command({
      name: "check",
      description: "Check each ref: a ref with a local draft checks its manifest, its body against its type's contract and its references, without network; any other issue number checks the published issue against the issue contract, reporting its sub-issues and blocking issues as open, closed by an unpushed `Closes` commit of its repository's checkout or closed on GitHub, and the checkout's commits `Towards` it. Exit 1 with one line per finding.",
      arguments: [
        argument({
          name: "refs",
          description: "draft file stems or issue numbers",
          variadic: true,
          separator: ",",
        }),
      ],
      options: [
        option({
          name: "for",
          type: "string",
          placeholder: "role",
          description: "who a published issue is checked for",
          choices: ["worker", "debugger"],
          default: "worker",
        }),
        option({
          name: "checkout",
          type: "string",
          placeholder: "checkout",
          description: "checkout whose commits up to `<ref>`, `HEAD` by default, count for its repository's issues, as `<registered short name>=<directory>[@<ref>]`; the current directory counts for its own repository unless a checkout names it; end with `@HEAD` when the directory holds an `@`",
          default: [],
          multiple: true,
        }),
      ],
      action() {
        return import("#bin/metalbrain/planning/issue/actions/check");
      },
    }),
    command({
      name: "publish",
      description: "Validate the drafts as a set, merge each claimed issue with its GitHub changes since the claim, create the new issues, then set each issue's title, body, type, labels, fields, state, sub-issues and blocked-by relations, render Plan roadmaps, clear `Drafting`, print each issue's diff and delete its files. Exit 1 with one line per finding, before any write.",
      arguments: [
        argument({
          name: "refs",
          description: "draft file stems",
          variadic: true,
          separator: ",",
        }),
      ],
      action() {
        return import("#bin/metalbrain/planning/issue/actions/publish");
      },
    }),
    command({
      name: "release",
      description: "For each issue number, remove `Drafting` from its Blockers, keeping its other options; fails when `.ai/issues/<n>.draft.md` exists.",
      arguments: [
        argument({
          name: "refs",
          description: "issue numbers",
          variadic: true,
          separator: ",",
        }),
      ],
      action() {
        return import("#bin/metalbrain/planning/issue/actions/release");
      },
    }),
  ],
});
