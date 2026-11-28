import type { Reporter } from "#nexus/reports/index";

// @debt resolves the config again after a failure instead of reading the config the failing command already resolved
/**
 * Whether the `debug` config key turns debug on for a failed run of one of
 * engrenage's programs, loading the config only then.
 */
export async function resolveConfiguredDebug(
  reporter: Reporter,
): Promise<boolean> {
  const { loadValidatedConfig } = await import("#project/config/index");

  const config = await loadValidatedConfig(undefined, { reporter });

  return config.resolve("debug");
}
