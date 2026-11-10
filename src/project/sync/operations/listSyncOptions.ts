import { Option } from "@commander-js/extra-typings";

import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import type { LoadedConfig } from "#project/config/index";
import type { SyncOption } from "#project/sync/types/SyncOption";

export async function listSyncOptions(config: LoadedConfig): Promise<{
  targets: readonly string[];
  options: readonly SyncOption[];
}> {
  const contributions = await config.context.registry.contributions(
    "sync.targets",
    config,
  );

  const targets = map(contributions, ({ entry }) => entry.name);

  const options = flatMap(
    contributions,
    ({ entry: { name, flags = {} } }) => {
      return map(entries(flags), ([flag, description]): SyncOption => {
        return {
          target: name,
          flag,
          option: new Option(`--${name}-${flag}`, description),
        };
      });
    },
  );

  return {
    targets,
    options,
  };
}
