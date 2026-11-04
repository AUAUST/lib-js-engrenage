import type { EnvironmentStructure } from "#structure/types/EnvironmentStructure";

export interface ResolvedStructure {
  readonly src: EnvironmentStructure | undefined;
  readonly tests: EnvironmentStructure | undefined;
  readonly bin: EnvironmentStructure | undefined;
  readonly scripts: EnvironmentStructure | undefined;
  readonly tooling: EnvironmentStructure | undefined;
}
