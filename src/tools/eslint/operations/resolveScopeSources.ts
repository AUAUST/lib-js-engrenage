import {
  binSection,
  scriptsSection,
  sourceSection,
  testsSection,
  toolingSection,
} from "#project/environments/index";
import { filesSection } from "#project/structure/index";
import { workspacesSection } from "#project/workspaces/index";
import type { LoadedConfig } from "#project/config/index";
import type { ScopeSources } from "#tools/eslint/types/ScopeSources";

export async function resolveScopeSources(
  config: LoadedConfig,
): Promise<ScopeSources> {
  const [source, tests, bin, scripts, tooling, files, workspaces] =
    await Promise.all([
      config.resolve(sourceSection),
      config.resolve(testsSection),
      config.resolve(binSection),
      config.resolve(scriptsSection),
      config.resolve(toolingSection),
      config.resolve(filesSection),
      config.resolve(workspacesSection),
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
