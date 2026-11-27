import { command, option } from "#nexus/cli/index";

export default command({
  name: "upgrade",
  description: "Move the project to the latest pnpm within engrenage's pnpm range.",
  options: [
    option({
      name: "yes",
      type: "boolean",
      short: "y",
      description: "accept moving a newer pnpm back into the range",
      default: false,
    }),
  ],
  action() {
    return import("#bin/engrenage/pnpm/actions/upgrade");
  },
});
