import { argument, collectListArgument, command } from "#nexus/cli/index";

export default command({
  name: "claim",
  description: "For each published issue, write `.ai/issues/<ref>.md` with the manifest and body as fetched and `.ai/issues/<ref>.draft.md` with its manifest and body, then add `Drafting` to its Blockers when it belongs to the current repository; fails when a draft exists already.",
  arguments: [
    argument({
      name: "refs",
      description: "issue numbers of the current repository or `<repo>.<n>` of a registered repository, comma- or space-separated, such as `123,toolkit.124` or `123 toolkit.124`",
      variadic: true,
      reduce: collectListArgument,
    }),
  ],
  action() {
    return import("#bin/metalbrain/planning/issue/actions/claim");
  },
});
