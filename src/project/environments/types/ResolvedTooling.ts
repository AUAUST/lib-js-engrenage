import type { Runtime } from "#baseline/types/Runtime";
import type { ResolvedCodeEnvironment } from "#environments/types/ResolvedCodeEnvironment";
import type { Globs } from "#types/Globs";

export interface ResolvedTooling extends Omit<
  ResolvedCodeEnvironment,
  "generated" | "discovered"
> {
  readonly files: Globs;
  readonly runtime: Extract<Runtime, { kind: "node" }>;
}
