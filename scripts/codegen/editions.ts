import { command, option } from "#nexus/cli/index";

export default command({
  name: "editions",
  description: "Generate the ES editions of TypeScript with the Baseline date of each of their libs from web-features.",
  options: [
    option({
      name: "check",
      type: "boolean",
      description: "report an outdated file without writing it",
      default: false,
    }),
  ],
  action() {
    return import("#scripts/codegen/actions/editions");
  },
});
