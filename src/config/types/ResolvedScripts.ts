import type { ResolvedCodeEnvironment } from "#config/types/ResolvedCodeEnvironment";
import type { Runtime } from "#config/types/Runtime";

export interface ResolvedScripts extends ResolvedCodeEnvironment {
  readonly runtime: Extract<Runtime, { kind: "node" }>;
}
