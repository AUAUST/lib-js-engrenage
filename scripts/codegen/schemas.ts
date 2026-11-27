import { command, option } from "#nexus/cli/index";

export default command({
  name: "schemas",
  description: "Generate the JSON Schemas of the structure metadata files from their validation schemas.",
  options: [
    option({
      name: "check",
      type: "boolean",
      description: "report an outdated file without writing it",
      default: false,
    }),
  ],
  action() {
    return import("#scripts/codegen/actions/schemas");
  },
});
