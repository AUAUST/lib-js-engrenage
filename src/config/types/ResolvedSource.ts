import type { ResolvedCodeEnvironment } from "#config/types/ResolvedCodeEnvironment";
import type { Runtime } from "#config/types/Runtime";
import type { File } from "#types/File";
import type { ApiGroup } from "#typescript/types/ApiGroup";

export interface ResolvedSource extends ResolvedCodeEnvironment {
  readonly exports: Readonly<Record<string, File>> | undefined;
  readonly bundled: boolean;
  readonly runtime: Runtime | undefined;
  readonly apis: readonly ApiGroup[];
}
