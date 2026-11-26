import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Generate the execution API declaration groups from the lib.dom.d.ts of TypeScript.",
      )
      .argument("[groups...]", "groups to generate (all by default)")
      .option("--check", "report outdated groups without writing them", false);
  },
  action() {
    return import("#scripts/codegen/actions/apis");
  },
});
