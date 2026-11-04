import { defineVitestConfig } from "#tools/vitest/index";

export default defineVitestConfig({
  isolate: true,
  restoreMocks: true,
});
