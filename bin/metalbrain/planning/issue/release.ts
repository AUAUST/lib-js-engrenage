import { argument, command } from "#nexus/cli/index";

export default command({
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
});
