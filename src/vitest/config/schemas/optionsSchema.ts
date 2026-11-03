import { array, boolean, optional, strictObject, string } from "valibot";

export const optionsSchema = strictObject({
  // @debt Sharing workers by default silently breaks `vi.mock` in consumers whose test files load the same modules: whichever file runs first fixes the module graph for the others, so their tests pass or fail with scheduling.
  isolate: optional(boolean(), false),
  restoreMocks: optional(boolean()),
  // @debt guardOutDir switches one built-in plugin through its own flag instead of by plugin name, as the plugins option of defineTsdownConfig does
  guardOutDir: optional(boolean(), true),
  // @debt setupFiles replaces the files found through the setup role instead of adding to them, so a project cannot extend the discovered setup without repeating it
  setupFiles: optional(array(string())),
});
