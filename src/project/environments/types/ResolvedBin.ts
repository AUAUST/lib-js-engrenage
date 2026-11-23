import type { ResolvedCodeEnvironment } from "#project/environments/types/ResolvedCodeEnvironment";
import type { File } from "#types/File";

export interface ResolvedBin extends ResolvedCodeEnvironment {
  readonly entries: Readonly<Record<string, File>> | undefined;
}
