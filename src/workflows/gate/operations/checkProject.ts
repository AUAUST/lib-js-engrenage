import { loadLazy } from "#foundation/modules/index";
import { listCommandSteps } from "#workflows/gate/operations/listCommandSteps";
import { runSteps } from "#workflows/gate/operations/runSteps";
import { coverSteps } from "#workflows/gate/utils/coverSteps";
import type { LoadedConfig } from "#project/config/index";
import type { GateStep } from "#workflows/gate/apis/GateStep";
import type { GateChanges } from "#workflows/gate/types/GateChanges";
import type { GateGroupTiming } from "#workflows/gate/types/GateGroupTiming";
import type { GateRunReport } from "#workflows/gate/types/GateRunReport";

const noChanges: GateChanges = { files: [], removed: [] };

/**
 * Runs each step's whole-project check: the `generate` stage's one after another
 * first, ending the run when one fails, then the others concurrently, beside the
 * agents' commands, recording each group's timing into `groups`.
 */
export async function checkProject(
  config: LoadedConfig,
  groups: GateGroupTiming[],
): Promise<Omit<GateRunReport, "timings">> {
  const contributions = await config.context.registry.contributions(
    "gate.steps",
    config,
  );

  const generators: GateStep[] = [];
  const steps: GateStep[] = [];

  for (const { entry } of contributions) {
    const { check } = entry;

    if (check === undefined) {
      continue;
    }

    (entry.stage === "generate" ? generators : steps).push({
      audience: entry.audience,
      name: entry.name,
      async run() {
        const run = await loadLazy(check);

        return run(config);
      },
    });
  }

  const commands = await listCommandSteps(config);

  const generateOutcome = await runSteps(generators, noChanges, {
    group: "generate",
    concurrent: false,
  });

  groups.push(generateOutcome.timing);

  if (generateOutcome.failures.length > 0) {
    return {
      failures: generateOutcome.failures,
      warnings: [],
      checked: coverSteps([generators], "project"),
    };
  }

  const [stepOutcome, commandOutcome] = await Promise.all([
    runSteps(steps, noChanges, { group: "checks", concurrent: true }),
    runSteps(commands, noChanges, { group: "commands", concurrent: false }),
  ]);

  groups.push(stepOutcome.timing, commandOutcome.timing);

  return {
    failures: [...stepOutcome.failures, ...commandOutcome.failures],
    warnings: [],
    checked: coverSteps([generators, steps, commands], "project"),
  };
}
