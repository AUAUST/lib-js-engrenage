import type { ApiGroup, Runtime } from "#project/baseline/index";
import type { ResolvedCodeEnvironment } from "#project/environments/types/ResolvedCodeEnvironment";
import type { File } from "#types/File";

export interface ResolvedSource extends ResolvedCodeEnvironment {
  readonly exports: Promise<Readonly<Record<string, File>> | undefined>;
  readonly bundled: boolean;
  readonly runtime: Runtime | undefined;
  readonly apis: readonly ApiGroup[];
}
