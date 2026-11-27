import { command } from "#nexus/cli/index";

export default command({
  name: "prune",
  description: "Delete the current repository's labels absent from `github.labels`.",
  action() {
    return import("#bin/metalbrain/github/labels/actions/prune");
  },
});
