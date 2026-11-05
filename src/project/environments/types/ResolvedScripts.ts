import type { Runtime } from "#project/baseline/index";
import type { ResolvedCodeEnvironment } from "#project/environments/types/ResolvedCodeEnvironment";

export interface ResolvedScripts extends ResolvedCodeEnvironment {
  readonly runtime: Extract<Runtime, { kind: "node" }>;
}
