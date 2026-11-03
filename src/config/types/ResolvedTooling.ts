import type { ResolvedCodeEnvironment } from "#config/types/ResolvedCodeEnvironment";
import type { Runtime } from "#config/types/Runtime";
import type { Globs } from "#types/Globs";

export interface ResolvedTooling extends Omit<
  ResolvedCodeEnvironment,
  "generated" | "discovered"
> {
  readonly files: Globs;
  readonly runtime: Extract<Runtime, { kind: "node" }>;
}
