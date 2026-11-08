import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Generate the src.apis declaration groups from the lib.dom.d.ts of TypeScript.",
      )
      .argument("[groups...]", "groups to generate (all by default)")
      .option("--check", "report outdated groups without writing them", false);
  },
  action() {
    return import("#scripts/codegen/actions/apis");
  },
});
