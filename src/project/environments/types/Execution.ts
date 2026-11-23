import type { EnvironmentExecution } from "#batiment/environments/index";
import type { ApiGroup } from "#project/baseline/index";
import type { ExecutionGlobals } from "#project/environments/types/ExecutionGlobals";
import type { ModuleFormat } from "#project/environments/types/ModuleFormat";

/**
 * The execution engrenage's environments state: a `YYYY-MM` baseline snapshot as
 * the syntax level of `isomorphic` or `browser` globals, a Node major as that of
 * `node` globals, and API groups only beside a baseline snapshot.
 */
export interface Execution extends EnvironmentExecution {
  readonly globals?: ExecutionGlobals;
  readonly apis?: readonly ApiGroup[];
  readonly syntax?: number | string;
  readonly module?: ModuleFormat;
}
