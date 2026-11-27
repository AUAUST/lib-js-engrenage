import { argument, command } from "#nexus/cli/index";

export default command({
  name: "relocate",
  description: "Rewrite the backlog sites under a moved file or directory to its new path.",
  arguments: [
    argument({
      name: "old",
      description: "the file's or directory's former path from the project root",
    }),
    argument({
      name: "new",
      description: "its new path from the project root",
    }),
  ],
  action() {
    return import("#bin/metalbrain/backlog/actions/relocate");
  },
});
