import { listUnstagedFiles, runGit, type ChangeMode } from "#tools/git/index";
import { runSteps } from "#workflows/gate/operations/runSteps";
import type { Directory } from "#types/Directory";
import type { GateStep } from "#workflows/gate/apis/GateStep";
import type { GateChanges } from "#workflows/gate/types/GateChanges";
import type { StepsOutcome } from "#workflows/gate/types/StepsOutcome";

const noOutcome: StepsOutcome = { failures: [], warnings: [] };

/**
 * Runs the `generate` stage's steps one after another and, in `staged` mode,
 * restages the tracked files they changed.
 */
export async function runGenerateStage(
  root: Directory,
  mode: ChangeMode,
  steps: readonly GateStep[],
  changes: GateChanges,
): Promise<StepsOutcome> {
  if (steps.length === 0) {
    return noOutcome;
  }

  const unstaged = mode === "staged" ? await listUnstagedFiles(root) : [];

  const outcome = await runSteps(steps, changes, { concurrent: false });

  if (mode === "staged") {
    const before = new Set(unstaged);

    const unstagedAfter = await listUnstagedFiles(root);

    const regenerated = unstagedAfter.filter((file) => !before.has(file));

    if (regenerated.length > 0) {
      await runGit(root, ["add", "--", ...regenerated]);
    }
  }

  return outcome;
}
