import type { LoadedConfig } from "#project/config/index";
import type { ScopeSources } from "#tools/eslint/types/ScopeSources";

export async function resolveScopeSources(
  config: LoadedConfig,
): Promise<ScopeSources> {
  const [source, tests, bin, scripts, tooling, files, workspaces] =
    await Promise.all([
      config.resolve("src"),
      config.resolve("tests"),
      config.resolve("bin"),
      config.resolve("scripts"),
      config.resolve("tooling"),
      config.resolve("files"),
      config.resolve("workspaces"),
    ]);

  return {
    src: source,
    tests,
    bin,
    scripts,
    tooling,
    files,
    workspaces,
  };
}
