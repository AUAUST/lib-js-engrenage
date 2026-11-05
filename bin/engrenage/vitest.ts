import { packages } from "#constants";
import { buildMode } from "#tools/vitest/constants";
import { defineToolCommands } from "#workflows/cli/operations/defineToolCommands";
import { ensureAnyOf } from "#workflows/cli/operations/ensureAnyOf";
import { ensureIncludes } from "#workflows/cli/operations/ensureIncludes";

function includeTypeTests(args: string[]) {
  ensureAnyOf(args, ["--typecheck", "--no-typecheck"], "--typecheck");
}

export const vitest = defineToolCommands({
  packageName: packages.vitest,
  commands: {
    "vitest": {
      message: "Running the tests...",
      arguments(config, args) {
        includeTypeTests(args);

        return ["run", ...args];
      },
    },
    "vitest:watch": {
      arguments(config, args) {
        includeTypeTests(args);

        return ["watch", ...args];
      },
    },
    "vitest:coverage": {
      message: "Running the tests with coverage...",
      arguments(config, args) {
        ensureIncludes(args, "--coverage");

        return ["run", ...args];
      },
    },
    "vitest:dist": {
      message: "Running the tests against the build output...",
      arguments(config, args) {
        includeTypeTests(args);
        ensureIncludes(args, ["--mode", buildMode]);

        return ["run", ...args];
      },
    },
  },
});
