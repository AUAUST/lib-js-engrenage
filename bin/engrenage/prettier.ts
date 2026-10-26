import { defineToolCommands } from "#support/commander/utils/defineToolCommands";

export default defineToolCommands({
  packageName: "prettier",
  commands: {
    "prettier": {
      description: "Format the given files.",
      arguments(config, args) {
        if (args.includes("--check") || args.includes("--write")) {
          return ["--ignore-unknown"];
        }

        return ["--write", "--ignore-unknown"];
      },
    },
    "prettier:check": {
      description: "Check the formatting of the given files.",
      arguments() {
        return ["--check", "--ignore-unknown"];
      },
    },
    "prettier:all": {
      description: "Format the whole project.",
      arguments(config) {
        return ["--write", "--ignore-unknown", config.root];
      },
    },
  },
});
