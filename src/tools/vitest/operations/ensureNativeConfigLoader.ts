import { ensureIncludes } from "#foundation/processes/index";
import { nativeConfigLoader } from "#tools/vite/constants";

/**
 * Adds the native config loader to Vitest's `args` while Node strips TypeScript
 * types, so Node loads the config, and linked packages' sources under the `source`
 * condition, instead of Vite bundling it.
 */
export function ensureNativeConfigLoader(
  args: string[],
  typescript: NodeJS.ProcessFeatures["typescript"] = process.features
    .typescript,
): string[] {
  if (typescript !== false) {
    ensureIncludes(args, nativeConfigLoader);
  }

  return args;
}
