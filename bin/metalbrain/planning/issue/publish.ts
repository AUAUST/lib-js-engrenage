import { argument, command } from "#nexus/cli/index";

export default command({
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
});
