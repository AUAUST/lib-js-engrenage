import type { EntryShape } from "#foundation/extensions/index";
import type { Directories } from "#types/Directories";

export interface EnvironmentEntry extends EntryShape {
  /**
   * Names the environment, its import category and the config key that resolves
   * it to a `ResolvedEnvironment`; its options are read from the `<name>.options`
   * key when its kind has a `structure`, otherwise from `<name>`.
   */
  readonly name: string;
  /**
   * Names the environment's kind, the `environmentKinds` entry giving its nature.
   */
  readonly kind: string;
  /**
   * Describes the environment's files as an import category in the project map.
   */
  readonly title: string;
  /**
   * Directories the environment claims, removed from every other environment's
   * directories unless those are configured explicitly.
   */
  readonly owns?: Directories;
}

declare global {
  namespace Engrenage {
    interface Slots {
      environments: EnvironmentEntry;
    }

    interface Environments {}
  }
}
