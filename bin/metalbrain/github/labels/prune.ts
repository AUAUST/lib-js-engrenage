import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Delete the current repository's labels absent from `github.labels`.",
    );
  },
  action() {
    return import("#bin/metalbrain/github/labels/actions/prune");
  },
});
