/**
 * How an environment's code executes, each field naming a value its
 * host interprets.
 */
export interface EnvironmentExecution {
  /**
   * The host whose globals and APIs the code reaches.
   */
  readonly globals?: string;
  /**
   * The API groups the code reaches beyond its host's globals.
   */
  readonly apis?: readonly string[];
  /**
   * The syntax level the code may use and its build lowers to: a dated snapshot
   * or a runtime version.
   */
  readonly syntax?: number | string;
  /**
   * The module format the code is written in.
   */
  readonly module?: string;
}
