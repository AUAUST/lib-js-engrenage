import type { EntryShape } from "#foundation/extensions/index";
import type { Directories } from "#types/Directories";

export interface EnvironmentEntry extends EntryShape {
  readonly name: string;
  readonly title: string;
  readonly level: "foreign" | "described" | "enforced";
  readonly structure?: "domains" | "roles";
  readonly consumesSource?: boolean;
  readonly imports?: readonly string[];
  readonly tsconfig?: boolean;
  readonly owns?: Directories;
}

declare global {
  interface EngrenageSlots {
    environments: EnvironmentEntry;
  }

  interface EngrenageEnvironments {}
}
