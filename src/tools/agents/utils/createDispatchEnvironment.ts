import { claudeVariables } from "#tools/agents/claude/constants";
import { codexVariables } from "#tools/agents/codex/constants";
import { removePnpmRunEnvironment } from "#tools/pnpm/index";

const clientVariables = [claudeVariables, codexVariables];

/**
 * The environment of a headless agent run: the caller's, without what its own
 * client set for its session and what pnpm set for the caller's package, which
 * would otherwise leak into the run's identity, effort and binaries.
 */
export function createDispatchEnvironment(
  environment: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(removePnpmRunEnvironment(environment)).filter(([name]) => {
      return !clientVariables.some(({ prefix, kept }) => {
        return (
          name.startsWith(prefix) &&
          !kept.some((configured: string) => configured === name)
        );
      });
    }),
  );
}
