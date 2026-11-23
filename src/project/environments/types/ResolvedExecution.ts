import type { ApiGroup, Runtime } from "#project/baseline/index";
import type { ExecutionGlobals } from "#project/environments/types/ExecutionGlobals";
import type { ModuleFormat } from "#project/environments/types/ModuleFormat";

export interface ResolvedExecution {
  readonly globals: ExecutionGlobals | undefined;
  readonly apis: readonly ApiGroup[];
  readonly module: ModuleFormat | undefined;
  /**
   * Whether the environment runs through a bundler pass: its registration's,
   * else its preset's, else the build tool's for an environment on the package
   * entries, else `false`.
   */
  readonly bundled: boolean;
  /**
   * The runtime its globals and syntax level give; `undefined` without globals
   * or, for a baseline host, without a syntax level, which warns once read.
   */
  readonly runtime: Runtime | undefined;
}
