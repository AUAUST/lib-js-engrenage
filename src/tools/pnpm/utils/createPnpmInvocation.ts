import type { Invocation } from "#project/steps/index";

export function createPnpmInvocation(
  args: readonly string[],
  { interactive = false }: { interactive?: boolean } = {},
): Invocation {
  return {
    command: "pnpm",
    args,
    interactive,
  };
}
