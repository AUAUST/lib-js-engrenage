import type { Settings } from "#vscode/types/Settings";

export type Setting =
  string | number | boolean | null | readonly Setting[] | Settings;
