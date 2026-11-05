import type { Runtime } from "#project/baseline/index";
import type { ResolvedCodeEnvironment } from "#project/environments/types/ResolvedCodeEnvironment";
import type { File } from "#types/File";

export interface ResolvedBin extends ResolvedCodeEnvironment {
  readonly commands: Readonly<Record<string, File>> | undefined;
  readonly runtime: Extract<Runtime, { kind: "node" }> | undefined;
}
