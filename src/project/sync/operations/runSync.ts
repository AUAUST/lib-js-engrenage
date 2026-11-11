import { includes, map } from "@auaust/primitive-kit/arrays";

import type { LoadedConfig } from "#project/config/index";
import type { SyncFailure } from "#project/sync/types/SyncFailure";
import type { SyncTargetFlags } from "#project/sync/types/SyncTargetFlags";

export async function runSync(
  config: LoadedConfig,
  {
    names,
    flags = {},
  }: {
    names?: readonly string[];
    flags?: SyncTargetFlags;
  } = {},
): Promise<readonly SyncFailure[]> {
  const { registry } = config.context;

  const contributions = await registry.contributions("sync.targets", config);

  const active = map(contributions, ({ entry }) => entry.name);

  const unknown = names?.find((name) => !includes(active, name));

  if (unknown !== undefined) {
    throw new Error(
      `Unknown sync target "${unknown}"; active targets: ${active.join(", ")}`,
    );
  }

  const selected = contributions.filter(({ entry }) => {
    return names === undefined || includes(names, entry.name);
  });

  const lastGenerator = selected.findLastIndex(({ entry }) => {
    return entry.stage === "generate";
  });

  const targets: string[] = [];

  const failures: SyncFailure[] = [];

  for (const [index, { entry }] of selected.entries()) {
    const run = await entry.load();

    const settings = flags[entry.name] ?? {};

    if (entry.stage === "check") {
      try {
        await run(config, settings);
      } catch (error) {
        failures.push({
          target: entry.name,
          error,
        });
      }
    } else {
      await run(config, settings);
    }

    targets.push(entry.name);

    if (index === lastGenerator) {
      config.forget();
    }
  }

  await registry.emit(
    "sync.done",
    {
      config,
      targets,
    },
    config,
  );

  return failures;
}
