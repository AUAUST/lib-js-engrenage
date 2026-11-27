import { command, option } from "#nexus/cli/index";

export default command({
  name: "rules",
  description: "Generate the typed ESLint rules interfaces from the plugins the shipped configuration registers.",
  options: [
    option({
      name: "check",
      type: "boolean",
      description: "report outdated files without writing them",
      default: false,
    }),
  ],
  action() {
    return import("#scripts/codegen/actions/rules");
  },
});
