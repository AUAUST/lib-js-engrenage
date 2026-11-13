import type { Settings } from "#tools/vscode/types/Settings";

/**
 * A JSON value of a VS Code setting.
 */
export type Setting =
  | string
  | number
  | boolean
  | null
  | readonly Setting[]
  | Settings;
