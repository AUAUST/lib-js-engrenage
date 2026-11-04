import type { Setting } from "#tools/vscode/types/Setting";

export interface Settings {
  readonly [key: string]: Setting | undefined;
}
