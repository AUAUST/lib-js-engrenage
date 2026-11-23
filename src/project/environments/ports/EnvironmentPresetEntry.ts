import type { EnvironmentPreset } from "#batiment/environments/index";
import type { EntryShape } from "#foundation/extensions/index";

export interface EnvironmentPresetEntry extends EntryShape, EnvironmentPreset {
  /**
   * Names the preset, which each registered environment tuning it names
   * as its `preset`.
   */
  readonly name: string;
  /**
   * Whether the preset's environments have a TypeScript project configuration,
   * read from the `tsconfig` option their options key must resolve.
   */
  readonly tsconfig?: boolean;
}

declare global {
  namespace Engrenage {
    interface Slots {
      environmentPresets: EnvironmentPresetEntry;
    }
  }
}
