import type { EntryShape } from "#foundation/extensions/index";
import type { PackageName } from "#types/PackageName";

export interface BuildTool extends EntryShape {
  readonly name: string;
  readonly package: PackageName;
}

declare global {
  interface EngrenageSlots {
    "build.tools": BuildTool;
  }

  interface EngrenageBuildTools {}
}
