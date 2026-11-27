import { command, option } from "#nexus/cli/index";

export default command({
  name: "init",
  description: "Set up engrenage in the project, or add the pieces it is missing.",
  options: [
    option({
      name: "yes",
      type: "boolean",
      short: "y",
      description: "accept every step without asking",
      default: false,
    }),
  ],
  action() {
    return import("#bin/engrenage/actions/init");
  },
});
