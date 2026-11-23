import type { ResolvedCodeEnvironment } from "#project/environments/types/ResolvedCodeEnvironment";
import type { Globs } from "#types/Globs";

export interface ResolvedTooling extends Omit<
  ResolvedCodeEnvironment,
  "generated" | "discovered"
> {
  readonly rootFiles: Globs;
}
