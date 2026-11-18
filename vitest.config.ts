import { defineVitestConfig } from "#tools/vitest/index";

export default defineVitestConfig(
  {
    restoreMocks: true,
  },
  {
    test: {
      maxWorkers: "50%",
    },
  },
);
