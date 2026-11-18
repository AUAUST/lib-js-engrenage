import { ensureIncludes, hasNodeCondition } from "#foundation/processes/index";
import { sourceCondition } from "#project/package/constants";
import { nativeConfigLoader } from "#tools/vite/constants";

/**
 * Adds the native config loader to Vitest's `args` while the `source` condition
 * is active, so the config loads linked packages' sources.
 */
export function ensureSourceConfigLoader(args: string[]): string[] {
  if (hasNodeCondition(sourceCondition)) {
    ensureIncludes(args, nativeConfigLoader);
  }

  return args;
}
