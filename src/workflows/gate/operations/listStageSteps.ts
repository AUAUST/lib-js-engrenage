import { loadLazy } from "#foundation/modules/index";
import { listCommandSteps } from "#workflows/gate/operations/listCommandSteps";
import type { LoadedConfig } from "#project/config/index";
import type { GateStage } from "#project/gate/index";
import type { GateStep } from "#workflows/gate/apis/GateStep";

/**
 * The steps the gate runs for `audience`, by stage; for agents, the `commands`
 * stage ends with the agents' commands.
 */
export async function listStageSteps(
  config: LoadedConfig,
  audience: GateStep["audience"],
): Promise<Record<GateStage, GateStep[]>> {
  const contributions = await config.context.registry.contributions(
    "gate.steps",
    config,
  );

  const steps: Record<GateStage, GateStep[]> = {
    generate: [],
    fixes: [],
    checks: [],
    commands: [],
    warnings: [],
  };

  for (const { entry } of contributions) {
    if (audience === "everyone" && entry.audience !== "everyone") {
      continue;
    }

    steps[entry.stage].push({
      audience: entry.audience,
      name: entry.name,
      async run(files, removed) {
        const run = await loadLazy(entry);

        return run(config, files, removed);
      },
    });
  }

  if (audience === "everyone") {
    return steps;
  }

  steps.commands.push(...(await listCommandSteps(config)));

  return steps;
}
