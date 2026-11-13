import type { EntryShape } from "#foundation/extensions/index";
import type { PackageName } from "#types/PackageName";

export interface BuildTool extends EntryShape {
  /**
   * The value of the `build.tool` option that selects the tool; with the option
   * unset, the only active tool is selected, and several throw.
   */
  readonly name: string;
  // @debt no consumer reads `package`, and the `build.tool` key resolving the selected tool has no reader either
  readonly package: PackageName;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "build.tools": BuildTool;
    }

    interface BuildTools {}
  }
}
