import type { ApiGroup } from "#project/baseline/types/ApiGroup";
import type { Runtime } from "#project/baseline/types/Runtime";
import type { ResolvedCodeEnvironment } from "#project/environments/types/ResolvedCodeEnvironment";
import type { File } from "#types/File";

export interface ResolvedSource extends ResolvedCodeEnvironment {
  readonly exports: Readonly<Record<string, File>> | undefined;
  readonly bundled: boolean;
  readonly runtime: Runtime | undefined;
  readonly apis: readonly ApiGroup[];
}
