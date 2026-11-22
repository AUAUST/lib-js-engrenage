import { entries, record } from "@auaust/toolkit/object";

import { claudeVariables } from "#metalbrain/runtimes/constants";

// @debt lists the Claude variables by hand instead of reading each from its `agents.runtimes` contribution, so a contributed runtime's session variables leak into the run
const clientVariables = [claudeVariables];

/**
 * The environment of a headless agent run: the caller's, without what its
 * own client set for its session and what `removeHostEnvironment` removes of
 * what the host set for the caller, which would otherwise leak into the run's
 * identity, effort and binaries.
 */
export function createDispatchEnvironment(
  environment: NodeJS.ProcessEnv,
  removeHostEnvironment: (environment: NodeJS.ProcessEnv) => NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  return record(
    entries(removeHostEnvironment(environment)).filter(([name]) => {
      return !clientVariables.some(({ prefix, kept }) => {
        return (
          name.startsWith(prefix) &&
          !kept.some((configured: string) => configured === name)
        );
      });
    }),
  );
}
