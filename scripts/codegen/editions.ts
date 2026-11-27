import { defineLazyCommand } from "#nexus/cli/index";

// eslint-disable-next-line auaust/import-effects -- #986
export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Generate the ES editions of TypeScript with the Baseline date of each of their libs from web-features.",
      )
      .option("--check", "report an outdated file without writing it", false);
  },
  action() {
    return import("#scripts/codegen/actions/editions");
  },
});
