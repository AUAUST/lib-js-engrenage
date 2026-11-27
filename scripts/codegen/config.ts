import { command, option } from "#nexus/cli/index";

export default command({
  name: "config",
  description: "Generate `ConfigInput` and the documented config input interfaces from the descriptions of the config schemas.",
  options: [
    option({
      name: "check",
      type: "boolean",
      description: "report an outdated file without writing it",
      default: false,
    }),
  ],
  action() {
    return import("#scripts/codegen/actions/config");
  },
});
