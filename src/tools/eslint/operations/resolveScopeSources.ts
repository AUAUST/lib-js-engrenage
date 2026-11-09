import { record } from "@auaust/toolkit/object";

import { readEnvironments } from "#project/environments/index";
import type { LoadedConfig } from "#project/config/index";
import type { ScopeSources } from "#tools/eslint/types/ScopeSources";

export async function resolveScopeSources(
  config: LoadedConfig,
): Promise<ScopeSources> {
  const [environments, tests, files, workspaces] = await Promise.all([
    readEnvironments(config),
    config.resolve("tests"),
    config.resolve("files"),
    config.resolve("workspaces"),
  ]);

  return {
    environments: record(
      environments.map((contributed) => {
        return [contributed.entry.name, contributed];
      }),
    ),
    tests,
    files,
    workspaces,
  };
}
