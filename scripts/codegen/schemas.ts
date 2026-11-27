import { defineLazyCommand } from "#nexus/cli/index";

// eslint-disable-next-line auaust/import-effects -- #986
export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Generate the JSON Schemas of the structure metadata files from their validation schemas.",
      )
      .option("--check", "report an outdated file without writing it", false);
  },
  action() {
    return import("#scripts/codegen/actions/schemas");
  },
});
