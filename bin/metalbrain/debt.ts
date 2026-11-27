import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description("List the @debt markers of the project.");
  },
  action() {
    return import("#bin/metalbrain/actions/debt");
  },
});
