import type { Settings } from "#tools/vscode/types/Settings";

export type Setting =
  string | number | boolean | null | readonly Setting[] | Settings;
