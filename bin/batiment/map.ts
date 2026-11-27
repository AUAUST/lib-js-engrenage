import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Print how batiment classifies the project directories.")
      .option("--check", "exit non-zero on any error diagnostic", false);
  },
  action() {
    return import("#bin/batiment/actions/map");
  },
});
