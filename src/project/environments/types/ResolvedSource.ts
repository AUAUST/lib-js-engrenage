import type { ApiGroup, Runtime } from "#project/baseline/index";
import type { ResolvedCodeEnvironment } from "#project/environments/types/ResolvedCodeEnvironment";

export interface ResolvedSource extends ResolvedCodeEnvironment {
  readonly bundled: boolean;
  readonly runtime: Runtime | undefined;
  readonly apis: readonly ApiGroup[];
}
