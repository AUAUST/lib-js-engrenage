import { command, option } from "#nexus/cli/index";

export default command({
  name: "sync",
  description: "Create and update the current repository's labels from `github.labels`, never deleting one.",
  options: [
    option({
      name: "check",
      type: "boolean",
      description: "write nothing and exit non-zero on a missing, differing or extra label",
      default: false,
    }),
  ],
  action() {
    return import("#bin/metalbrain/github/labels/actions/sync");
  },
});
