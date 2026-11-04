import type { Runtime } from "#baseline/types/Runtime";
import type { ResolvedCodeEnvironment } from "#environments/types/ResolvedCodeEnvironment";
import type { File } from "#types/File";

export interface ResolvedBin extends ResolvedCodeEnvironment {
  readonly commands: Readonly<Record<string, File>> | undefined;
  readonly runtime: Extract<Runtime, { kind: "node" }> | undefined;
}
