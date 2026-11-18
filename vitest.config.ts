import { defineVitestConfig } from "#tools/vitest/index";

export default defineVitestConfig.at(import.meta.url)(
  {
    restoreMocks: true,
  },
  {
    test: {
      maxWorkers: "50%",
    },
  },
);
