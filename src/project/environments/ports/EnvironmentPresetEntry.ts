import type { EnvironmentPreset } from "#batiment/environments/index";
import type { EntryShape } from "#foundation/extensions/index";
import type { Execution } from "#project/environments/types/Execution";

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
  /**
   * How the preset's environments execute, each field kept unless their
   * registration tunes it.
   */
  readonly execution?: Execution;
}

declare global {
  namespace Engrenage {
    interface Slots {
      environmentPresets: EnvironmentPresetEntry;
    }
  }
}
