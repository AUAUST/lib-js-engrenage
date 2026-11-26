export function isDebugEnvironment(
  variable: string,
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = environment[variable];

  return value === "1" || value === "true";
}
