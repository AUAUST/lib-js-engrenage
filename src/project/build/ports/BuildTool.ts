import type { EffectGlobals } from "#batiment/effects/index";
import type { EntryShape } from "#foundation/extensions/index";
import type { Directory } from "#types/Directory";
import type { PackageName } from "#types/PackageName";

export interface BuildTool extends EntryShape {
  /**
   * The value of the `build.tool` option that selects the tool; with the option
   * unset, the active tool the preset prefers is selected, else the only active
   * one, and several are a config error.
   */
  readonly name: string;
  /**
   * The package providing the tool.
   */
  readonly package: PackageName;
  /**
   * Output directory `build.outDir` falls back to when the base tsconfig
   * sets none.
   */
  readonly outDir?: Directory;
  /**
   * Whether the tool bundles: the bundler pass of the environments on the package
   * entries whose registration and preset state none; `false` when unset.
   */
  readonly bundled?: boolean;
  /**
   * Types appended to the src tsconfig default `types`.
   */
  readonly types?: readonly string[];
  /**
   * Ranks of the globals its bundler pass replaces, keyed by member path, over
   * the host's ranks in the environments it bundles.
   */
  readonly globals?: EffectGlobals;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "build.tools": BuildTool;
    }

    interface BuildTools {}
  }
}
