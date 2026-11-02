import { boolean, optional, strictObject } from "valibot";

export const optionsSchema = strictObject({
  // @debt Sharing workers by default silently breaks `vi.mock` in consumers whose test files load the same modules: whichever file runs first fixes the module graph for the others, so their tests pass or fail with scheduling.
  isolate: optional(boolean(), false),
  restoreMocks: optional(boolean()),
  guardOutDir: optional(boolean(), true),
});
