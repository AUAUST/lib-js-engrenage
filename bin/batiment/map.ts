// @debt builds on engrenage's `workflows/cli` helpers until they move to nexus (BL-4e55ba)
import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Print how batiment classifies the project directories.")
      .option("--check", "exit non-zero on any error diagnostic", false)
      .option(
        "--json",
        "print the report's facts and diagnostics as JSON",
        false,
      );
  },
  action() {
    return import("#bin/batiment/actions/map");
  },
});
