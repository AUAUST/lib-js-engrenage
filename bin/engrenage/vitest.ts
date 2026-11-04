import { defineToolCommands } from "#cli/utils/defineToolCommands";
import { ensureAnyOf } from "#cli/utils/ensureAnyOf";
import { ensureIncludes } from "#cli/utils/ensureIncludes";
import { packages } from "#constants";
import { buildMode } from "#vitest/constants";

function includeTypeTests(args: string[]) {
  ensureAnyOf(args, ["--typecheck", "--no-typecheck"], "--typecheck");
}

export const vitest = defineToolCommands({
  packageName: packages.vitest,
  commands: {
    "vitest": {
      description: "Run the tests once, with type tests unless --no-typecheck.",
      message: "Running the tests...",
      arguments(config, args) {
        includeTypeTests(args);

        return ["run", ...args];
      },
    },
    "vitest:watch": {
      description:
        "Run the tests in watch mode, with type tests unless --no-typecheck.",
      arguments(config, args) {
        includeTypeTests(args);

        return ["watch", ...args];
      },
    },
    "vitest:coverage": {
      description: "Run the tests once and report coverage.",
      message: "Running the tests with coverage...",
      arguments(config, args) {
        ensureIncludes(args, "--coverage");

        return ["run", ...args];
      },
    },
    "vitest:dist": {
      description: "Run the tests once against the built output.",
      message: "Running the tests against the build output...",
      arguments(config, args) {
        includeTypeTests(args);
        ensureIncludes(args, ["--mode", buildMode]);

        return ["run", ...args];
      },
    },
  },
});
