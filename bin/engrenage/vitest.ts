import { vitest } from "#constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { ensureIncludes } from "#support/commander/utils/ensureIncludes";
import { buildMode } from "#vitest/constants";

export default defineToolCommands({
  packageName: vitest,
  commands: {
    "vitest": {
      description: "Run the tests once, with type tests.",
      arguments(config, args) {
        ensureIncludes(args, "--typecheck");

        return ["run", ...args];
      },
    },
    "vitest:watch": {
      description: "Run the tests in watch mode, with type tests.",
      arguments(config, args) {
        ensureIncludes(args, "--typecheck");

        return ["watch", ...args];
      },
    },
    "vitest:coverage": {
      description: "Run the tests once and report coverage.",
      arguments(config, args) {
        ensureIncludes(args, "--coverage");

        return ["run", ...args];
      },
    },
    "vitest:dist": {
      description: "Run the tests once against the built output.",
      arguments(config, args) {
        ensureIncludes(args, "--typecheck");
        ensureIncludes(args, ["--mode", buildMode]);

        return ["run", ...args];
      },
    },
  },
});
