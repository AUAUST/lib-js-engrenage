import type { Runtime } from "#baseline/types/Runtime";
import type { ResolvedCodeEnvironment } from "#environments/types/ResolvedCodeEnvironment";

export interface ResolvedScripts extends ResolvedCodeEnvironment {
  readonly runtime: Extract<Runtime, { kind: "node" }>;
}
