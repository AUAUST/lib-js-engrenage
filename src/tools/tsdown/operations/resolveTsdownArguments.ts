import { ensureIncludes } from "#foundation/processes/index";

export function resolveTsdownArguments(args: readonly string[]): string[] {
  const resolved = [...args];

  ensureIncludes(resolved, ["--config-loader", "tsx"]);

  return resolved;
}
