import type { Setting } from "#vscode/types/Setting";

export interface Settings {
  readonly [key: string]: Setting | undefined;
}
