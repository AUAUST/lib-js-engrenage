import type { Setting } from "#tools/vscode/types/Setting";

/**
 * VS Code settings by key, merged into the settings file key by key down nested
 * objects.
 */
export interface Settings {
  readonly [key: string]: Setting | undefined;
}
