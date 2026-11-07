import { debugEnvironmentVariable } from "#workflows/cli/constants";

export function isDebugEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = environment[debugEnvironmentVariable];

  return value === "1" || value === "true";
}
