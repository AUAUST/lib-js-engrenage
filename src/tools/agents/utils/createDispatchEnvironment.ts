import { entries, record } from "@auaust/toolkit/object";

import { claudeVariables } from "#metalbrain/runtimes/constants";
import { removePnpmRunEnvironment } from "#tools/pnpm/index";

// @debt lists the Claude variables by hand instead of reading each from its `agents.runtimes` contribution, so a contributed runtime's session variables leak into the run
const clientVariables = [claudeVariables];

/**
 * The environment of a headless agent run: the caller's, without what its own
 * client set for its session and what pnpm set for the caller's package, which
 * would otherwise leak into the run's identity, effort and binaries.
 */
export function createDispatchEnvironment(
  environment: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  return record(
    entries(removePnpmRunEnvironment(environment)).filter(([name]) => {
      return !clientVariables.some(({ prefix, kept }) => {
        return (
          name.startsWith(prefix) &&
          !kept.some((configured: string) => configured === name)
        );
      });
    }),
  );
}
