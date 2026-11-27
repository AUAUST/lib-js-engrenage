import { command, option } from "#nexus/cli/index";

export default command({
  name: "batiment",
  description: "Walk the project structure and report how batiment classifies it.",
  subcommands: [
    command({
      name: "map",
      description: "Print how batiment classifies the project directories.",
      options: [
        option({
          name: "check",
          type: "boolean",
          description: "exit non-zero on any error diagnostic",
          default: false,
        }),
      ],
      action() {
        return import("#bin/batiment/actions/map");
      },
    }),
  ],
});
