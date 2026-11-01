import { defineVitestConfig } from "#vitest/index";

export default defineVitestConfig(undefined, {
  test: {
    setupFiles: ["tests/setup.ts"],
  },
});
