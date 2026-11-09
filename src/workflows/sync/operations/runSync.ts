import { includes, map } from "@auaust/primitive-kit/arrays";

import type { LoadedConfig } from "#project/config/index";
import type { SyncTargetFlags } from "#workflows/sync/types/SyncTargetFlags";

export async function runSync(
  config: LoadedConfig,
  {
    names,
    flags = {},
  }: {
    names?: readonly string[];
    flags?: SyncTargetFlags;
  } = {},
) {
  const { registry } = config.context;

  const contributions = await registry.contributions("sync.targets");

  const active = map(contributions, ({ entry }) => entry.name);

  const unknown = names?.find((name) => !includes(active, name));

  if (unknown !== undefined) {
    throw new Error(
      `Unknown sync target "${unknown}"; active targets: ${active.join(", ")}`,
    );
  }

  const targets: string[] = [];

  for (const { entry } of contributions) {
    if (names !== undefined && !includes(names, entry.name)) {
      continue;
    }

    const run = await entry.load();

    await run(config, flags[entry.name] ?? {});

    targets.push(entry.name);
  }

  await registry.emit("sync.done", {
    config,
    targets,
  });
}
