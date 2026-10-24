import { typescriptFiles } from "#eslint/presets/typescriptFiles";

export function filesIn(directory: string): string {
  return `${directory}/${typescriptFiles}`;
}
