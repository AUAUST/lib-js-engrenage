import { defineVitestConfig } from "#vitest/index";

export default defineVitestConfig(
  {
    isolate: true,
    restoreMocks: true,
  },
  {
    test: {
      setupFiles: ["tests/setup.ts"],
    },
  },
);
