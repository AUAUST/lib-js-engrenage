import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { deduplicate, filter, map } from "@auaust/primitive-kit/arrays";

import { readTextFile, resolveWithin } from "#foundation/filesystem/index";
import { LockTimeoutError } from "#foundation/processes/errors/LockTimeoutError";
import { withProcessLock } from "#foundation/processes/index";
import { cacheSection } from "#project/cache/index";
import {
  agentsSection,
  formatBudgetFinding,
  listLocalFilePatterns,
  measureEditedFile,
} from "#tools/agents/index";
import {
  gitSection,
  listChangedFiles,
  listLocalFiles,
  listPartiallyStagedFiles,
  runGit,
  type ChangeMode,
} from "#tools/git/index";
import { createGateSteps } from "#workflows/gate/operations/createGateSteps";
import { readTreeIdentity } from "#workflows/gate/operations/readTreeIdentity";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";
import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateReport } from "#workflows/gate/types/GateReport";
import type { GateResult } from "#workflows/gate/types/GateResult";
import type { GateStep } from "#workflows/gate/types/GateStep";
import type { GateWarning } from "#workflows/gate/types/GateWarning";
import type { TreeIdentity } from "#workflows/gate/types/TreeIdentity";

const cacheName = "gate";

const stampFile = "passed";

const stampLimit = 20;

const lockFile = "lock";

const lockTimeout = 5 * 60_000;

const lockLabels = {
  staged: "staged gate",
  worktree: "worktree gate",
} as const satisfies Record<ChangeMode, string>;

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

function formatStamp(mode: ChangeMode, identity: TreeIdentity): string {
  return `${mode} ${identity.head} ${identity.committable} ${identity.checked}`;
}

function isReusable(
  stamp: string,
  mode: ChangeMode,
  identity: TreeIdentity,
): boolean {
  const [stampMode, head, committable, checked] = stamp.split(" ");

  if (head !== identity.head) {
    return false;
  }

  if (mode === "worktree") {
    return stampMode === "worktree" && checked === identity.checked;
  }

  return (
    committable === identity.committable &&
    (stampMode === "worktree" || checked === identity.checked)
  );
}

async function checkVerifiedTree(
  root: Directory,
  mode: ChangeMode,
  verified: TreeIdentity,
  current: TreeIdentity,
): Promise<GateFailure | undefined> {
  const changed: (readonly [string, string])[] = [];

  if (verified.committable !== current.committable) {
    changed.push([verified.committable, current.committable]);
  }

  if (mode === "staged" && verified.checked !== current.checked) {
    changed.push([verified.checked, current.checked]);
  }

  if (changed.length === 0) {
    return;
  }

  const outputs = await Promise.all(
    map(changed, ([before, after]) => {
      return runGit(root, ["diff-tree", "-r", "--name-only", before, after]);
    }),
  );

  const paths = deduplicate(
    outputs
      .join("\n")
      .split("\n")
      .filter((path) => path !== ""),
  );

  return {
    step: "verification",
    output: `Files changed while the gate verified them; run it again:\n${paths.join("\n")}`,
  };
}

async function checkLocalFiles(
  config: LoadedConfig,
  mode: ChangeMode,
  files: Files,
): Promise<GateFailure[]> {
  if (mode !== "staged") {
    return [];
  }

  const { root } = config.context;

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

  return runSteps([local], files);
}

// @debt ESLint runs only on changed files, so a type change that breaks a dependent's type-aware rule passes until CI's full `lint`
async function verify(
  config: LoadedConfig,
  mode: ChangeMode,
): Promise<GateReport> {
  const { root } = config.context;

  const files = await listChangedFiles(root, mode);

  const localFailures = await checkLocalFiles(config, mode, files);

  if (localFailures.length > 0) {
    return { failures: localFailures, warnings: [] };
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

  if (files.length === 0) {
    return { failures: [], warnings: [] };
  }

  const cache = await config.resolve(cacheSection);

  const stamp = resolveWithin(root, cache.for(cacheName), stampFile);

  const stamps = await readStamps(stamp);

  const initial = await readTreeIdentity(config, mode);

  // @debt a stamped tree reports no budget warnings, so the commit after a passing stop never shows them again.
  if (stamps.some((line) => isReusable(line, mode, initial))) {
    return { failures: [], warnings: [] };
  }

  const { fixes, checks, commands, warnings } = await createGateSteps(config);

  const failures = await runSteps(fixes, files);

  if (mode === "staged") {
    await runGit(root, ["add", "--", ...files]);
  }

  const verified = await readTreeIdentity(config, mode);

  const [checkFailures, duplicates] = await Promise.all([
    runConcurrentSteps(checks, files),
    runConcurrentSteps(warnings, files),
  ]);

  failures.push(...checkFailures, ...(await runSteps(commands, files)));

  const current = await readTreeIdentity(config, mode);

  const changed = await checkVerifiedTree(root, mode, verified, current);

  if (changed !== undefined) {
    failures.push(changed);
  }

  if (failures.length === 0) {
    await mkdir(dirname(stamp), { recursive: true });

    await writeFile(
      stamp,
      `${[...stamps, formatStamp(mode, verified)].slice(-stampLimit).join("\n")}\n`,
    );
  }

  return {
    failures,
    warnings: [...(await measureEntries(config, files)), ...duplicates],
  };
}

export async function runGate(
  config: LoadedConfig,
  {
    mode,
    audience = "agents",
  }: { mode: ChangeMode; audience?: GateStep["audience"] },
): Promise<GateReport> {
  const { root } = config.context;

  if (audience === "everyone") {
    const files = await listChangedFiles(root, mode);

    return {
      failures: await checkLocalFiles(config, mode, files),
      warnings: [],
    };
  }

  const cache = await config.resolve(cacheSection);

  const lock = resolveWithin(root, cache.for(cacheName), lockFile);

  const label = lockLabels[mode];

  try {
    // @debt a gate killed by a signal releases the lock while the tools it spawned may still write files
    return await withProcessLock(
      lock,
      {
        label,
        timeout: lockTimeout,
        onWait(holder) {
          process.stderr.write(
            `Waiting for the ${holder.label} of process ${holder.pid}, started ${holder.started}…\n`,
          );
        },
      },
      () => verify(config, mode),
    );
  } catch (error) {
    if (!(error instanceof LockTimeoutError)) {
      throw error;
    }

    return {
      failures: [
        {
          step: "lock",
          output: `${error.message}; rerun once it finishes, or delete the file if no gate is running.`,
        },
      ],
      warnings: [],
    };
  }
}
