import { argument, command, option } from "#nexus/cli/index";
import { apiSourceLibrary } from "#project/baseline/constants";

export default command({
  name: "apis",
  description: `Generate the execution API declaration groups from the ${apiSourceLibrary} of TypeScript.`,
  arguments: [
    argument({
      name: "groups",
      description: "groups to generate (all by default)",
      optional: true,
      variadic: true,
    }),
  ],
  options: [
    option({
      name: "check",
      type: "boolean",
      description: "report outdated groups without writing them",
      default: false,
    }),
  ],
  action() {
    return import("#scripts/codegen/actions/apis");
  },
});
