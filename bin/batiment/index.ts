import { command } from "#nexus/cli/index";

export default command({
  name: "batiment",
  description: "Walk the project structure and report how batiment classifies it.",
  subcommands: [
    () => {
      return import("#bin/batiment/builtins");
    },
  ],
});
