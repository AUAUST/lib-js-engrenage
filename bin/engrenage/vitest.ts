import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { buildMode } from "#vitest/constants";

export default defineToolCommands({
  packageName: "vitest",
  commands: {
    "vitest": {
      description: "Run the tests once, with type tests.",
      arguments() {
        return ["run", "--typecheck"];
      },
    },
    "vitest:watch": {
      description: "Run the tests in watch mode, with type tests.",
      arguments() {
        return ["watch", "--typecheck"];
      },
    },
    "vitest:coverage": {
      description: "Run the tests once and report coverage.",
      arguments() {
        return ["run", "--coverage"];
      },
    },
    "vitest:dist": {
      description: "Run the tests once against the built output.",
      arguments() {
        return ["run", "--typecheck", "--mode", buildMode];
      },
    },
  },
});
