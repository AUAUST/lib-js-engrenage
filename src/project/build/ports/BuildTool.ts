import type { EntryShape } from "#foundation/extensions/index";
import type { PackageName } from "#types/PackageName";

export interface BuildTool extends EntryShape {
  readonly name: string;
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
