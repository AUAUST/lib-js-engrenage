import type { ResolvedCodeEnvironment } from "#config/types/ResolvedCodeEnvironment";
import type { Runtime } from "#config/types/Runtime";
import type { File } from "#types/File";

export interface ResolvedBin extends ResolvedCodeEnvironment {
  readonly commands: Readonly<Record<string, File>> | undefined;
  readonly runtime: Extract<Runtime, { kind: "node" }> | undefined;
}
