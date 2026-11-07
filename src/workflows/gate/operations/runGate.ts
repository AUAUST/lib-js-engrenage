import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { filter, map } from "@auaust/primitive-kit/arrays";

import { readTextFile, resolveWithin } from "#foundation/filesystem/index";
import { cacheSection } from "#project/cache/index";
import {
  agentsSection,
  formatBudgetFinding,
  listLocalFilePatterns,
  measureEditedFile,
} from "#tools/agents/index";
import {
  gitSection,
  hashTree,
  listChangedFiles,
  listLocalFiles,
  listPartiallyStagedFiles,
  runGit,
  type ChangeMode,
} from "#tools/git/index";
import { createGateSteps } from "#workflows/gate/operations/createGateSteps";
import type { LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";
import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateReport } from "#workflows/gate/types/GateReport";
import type { GateResult } from "#workflows/gate/types/GateResult";
import type { GateStep } from "#workflows/gate/types/GateStep";
import type { GateWarning } from "#workflows/gate/types/GateWarning";

const stampName = "gate";

const stampFile = "passed";

const stampLimit = 20;

async function runStep(
  step: GateStep,
  files: Files,
): Promise<GateFailure | undefined> {
  let result: GateResult;

  try {
    result = await step.run(files);
  } catch (error) {
    result = {
      ok: false,
      output: error instanceof Error ? error.message : String(error),
    };
  }

  return result.ok ? undefined : { step: step.name, output: result.output };
}

async function runSteps(
  steps: readonly GateStep[],
  files: Files,
): Promise<GateFailure[]> {
  const failures: GateFailure[] = [];

  for (const step of steps) {
    const failure = await runStep(step, files);

    if (failure !== undefined) {
      failures.push(failure);
    }
  }

  return failures;
}

async function runConcurrentSteps(
  steps: readonly GateStep[],
  files: Files,
): Promise<GateFailure[]> {
  const results = await Promise.all(
    map(steps, (step) => {
      return runStep(step, files);
    }),
  );

  return filter(results, (failure) => failure !== undefined);
}

// @debt in staged mode the entries are read from the worktree, not from the index the commit records.
async function measureEntries(
  config: LoadedConfig,
  files: Files,
): Promise<GateWarning[]> {
  const { root } = config.context;

  const { budgets } = await config.resolve(agentsSection);

  const findings = await Promise.all(
    files.map((file) => {
      return measureEditedFile(root, resolveWithin(root, file), budgets);
    }),
  );

  const flattened = findings.flat();

  return flattened.length === 0
    ? []
    : [
        {
          step: "budgets",
          output: map(flattened, formatBudgetFinding).join("\n"),
        },
      ];
}

async function readStamps(file: string): Promise<readonly string[]> {
  const content = await readTextFile(file);

  return content?.split("\n").filter((line) => line !== "") ?? [];
}

// @debt ESLint runs only on changed files, so a type change that breaks a dependent's type-aware rule passes until CI's full `lint`
export async function runGate(
  config: LoadedConfig,
  {
    mode,
    audience = "agents",
  }: { mode: ChangeMode; audience?: GateStep["audience"] },
): Promise<GateReport> {
  const { root } = config.context;

  const files = await listChangedFiles(root, mode);

  if (mode === "staged") {
    const git = await config.resolve(gitSection);

    const globs = await listLocalFilePatterns(config);

    const local: GateStep = {
      audience: "everyone",
      name: "local files",
      async run(changed) {
        const protectedFiles = await listLocalFiles(git, root, globs, changed);

        return {
          ok: protectedFiles.length === 0,
          output: `Local files cannot be committed:\n${protectedFiles.join("\n")}\nUse git restore --staged -- <paths> to unstage them, or git rm --cached -- <paths> to stop tracking them.`,
        };
      },
    };

    const failures = await runSteps([local], files);

    if (failures.length > 0) {
      return { failures, warnings: [] };
    }
  }

  if (audience === "everyone") {
    return { failures: [], warnings: [] };
  }

  if (mode === "staged") {
    const partial = await listPartiallyStagedFiles(root);

    if (partial.length > 0) {
      return {
        failures: [
          {
            step: "staging",
            output: `Stage the whole file, since the fixes would stage its unstaged hunks:\n${partial.join("\n")}`,
          },
        ],
        warnings: [],
      };
    }
  }

  const cache = await config.resolve(cacheSection);

  const stamp = resolveWithin(root, cache.for(stampName), stampFile);

  const stamps = await readStamps(stamp);

  // @debt a stamped tree reports no budget warnings, so the commit after a passing stop never shows them again.
  if (files.length === 0 || stamps.includes(await hashTree(root, mode))) {
    return { failures: [], warnings: [] };
  }

  const { fixes, checks, commands, warnings } = await createGateSteps(config);

  const failures = await runSteps(fixes, files);

  if (mode === "staged") {
    await runGit(root, ["add", "--", ...files]);
  }

  const [checkFailures, duplicates] = await Promise.all([
    runConcurrentSteps(checks, files),
    runConcurrentSteps(warnings, files),
  ]);

  failures.push(...checkFailures, ...(await runSteps(commands, files)));

  if (failures.length === 0) {
    await mkdir(dirname(stamp), { recursive: true });

    await writeFile(
      stamp,
      `${[...stamps, await hashTree(root, mode)].slice(-stampLimit).join("\n")}\n`,
    );
  }

  return {
    failures,
    warnings: [...(await measureEntries(config, files)), ...duplicates],
  };
}
