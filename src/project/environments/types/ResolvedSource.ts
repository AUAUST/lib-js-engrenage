import type { ApiGroup } from "#baseline/types/ApiGroup";
import type { Runtime } from "#baseline/types/Runtime";
import type { ResolvedCodeEnvironment } from "#environments/types/ResolvedCodeEnvironment";
import type { File } from "#types/File";

export interface ResolvedSource extends ResolvedCodeEnvironment {
  readonly exports: Readonly<Record<string, File>> | undefined;
  readonly bundled: boolean;
  readonly runtime: Runtime | undefined;
  readonly apis: readonly ApiGroup[];
}
