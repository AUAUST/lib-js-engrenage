import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { iterable } from "@auaust/toolkit";
import { toArray } from "@auaust/toolkit/array";

import { readTextFile, resolveWithin } from "#foundation/filesystem/index";
import { loadLazy } from "#foundation/modules/index";
import { LockTimeoutError } from "#foundation/processes/errors/LockTimeoutError";
import { withProcessLock } from "#foundation/processes/index";
import { runGateProcess, type GateStage } from "#project/gate/index";
import { listLocalFilePatterns } from "#tools/agents/index";
import {
  listChangedFiles,
  listLocalFiles,
  listPartiallyStagedFiles,
  runGit,
  type ChangeMode,
} from "#tools/git/index";
import { measureEntries } from "#workflows/gate/operations/measureEntries";
import { readTreeIdentity } from "#workflows/gate/operations/readTreeIdentity";
import { runSteps } from "#workflows/gate/operations/runSteps";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";
import type { GateStep } from "#workflows/gate/apis/GateStep";
import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateMode } from "#workflows/gate/types/GateMode";
import type { GateReport } from "#workflows/gate/types/GateReport";
import type { GateWarning } from "#workflows/gate/types/GateWarning";
import type { StepsOutcome } from "#workflows/gate/types/StepsOutcome";
import type { TreeIdentity } from "#workflows/gate/types/TreeIdentity";

const stampFile = "passed";

const stampLimit = 20;

const lockFile = "lock";

const lockTimeout = 5 * 60_000;

const lockLabels = {
  staged: "staged gate",
  worktree: "worktree gate",
  all: "whole-project gate",
} as const satisfies Record<GateMode, string>;

async function listSteps(
  config: LoadedConfig,
  audience: GateStep["audience"],
): Promise<Record<GateStage, GateStep[]>> {
  const contributions = await config.context.registry.contributions(
    "gate.steps",
    config,
  );

  const steps: Record<GateStage, GateStep[]> = {
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
      async run(files) {
        const run = await loadLazy(entry);

        return run(config, files);
      },
    });
  }

  if (audience === "everyone") {
    return steps;
  }

  steps.commands.push(...(await listCommandSteps(config)));

  return steps;
}

async function listCommandSteps(config: LoadedConfig): Promise<GateStep[]> {
  const { gate } = await config.resolve("agents");

  return gate.commands.map((command) => {
    return {
      audience: "agents",
      name: command,
      run() {
        return runGateProcess(config.context.root, "sh", ["-c", command]);
      },
    };
  });
}

async function checkProject(config: LoadedConfig): Promise<GateReport> {
  const contributions = await config.context.registry.contributions(
    "gate.steps",
    config,
  );

  const steps: GateStep[] = [];

  for (const { entry } of contributions) {
    const { check } = entry;

    if (check === undefined) {
      continue;
    }

    steps.push({
      audience: entry.audience,
      name: entry.name,
      async run() {
        const run = await loadLazy(check);

        return run(config);
      },
    });
  }

  const commands = await listCommandSteps(config);

  const [stepOutcome, commandOutcome] = await Promise.all([
    runSteps(steps, [], { concurrent: true }),
    runSteps(commands, [], { concurrent: false }),
  ]);

  return {
    failures: [...stepOutcome.failures, ...commandOutcome.failures],
    warnings: [],
  };
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
    iterable.map(changed, ([before, after]) => {
      return runGit(root, ["diff-tree", "-r", "--name-only", before, after]);
    }),
  );

  const paths = toArray(
    iterable.unique(
      outputs
        .join("\n")
        .split("\n")
        .filter((path) => path !== ""),
    ),
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
): Promise<StepsOutcome> {
  if (mode !== "staged") {
    return { failures: [], warnings: [] };
  }

  const { root } = config.context;

  const git = await config.resolve("git");

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

  return runSteps([local], files, { concurrent: false });
}

async function warnUnstagedChanges(
  root: Directory,
  mode: ChangeMode,
): Promise<readonly GateWarning[]> {
  if (mode !== "staged") {
    return [];
  }

  const unstaged = await listChangedFiles(root, "worktree");

  if (unstaged.length === 0) {
    return [];
  }

  return [
    {
      step: "staging",
      output: `No staged file to check, so nothing was checked; --worktree checks the unstaged changes:\n${unstaged.join("\n")}`,
    },
  ];
}

// @debt ESLint runs only on changed files, so a type change that breaks a dependent's type-aware rule passes until `gate --all`
async function verify(
  config: LoadedConfig,
  mode: ChangeMode,
  audience: GateStep["audience"],
): Promise<GateReport> {
  const { root } = config.context;

  const files = await listChangedFiles(root, mode);

  const local = await checkLocalFiles(config, mode, files);

  if (local.failures.length > 0) {
    return local;
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
    return { failures: [], warnings: await warnUnstagedChanges(root, mode) };
  }

  const agents = audience === "agents";

  const resources = await config.resolve("resources");

  const stamp = resolveWithin(resources.path("cache.gate"), stampFile);

  const stamps = agents ? await readStamps(stamp) : [];

  if (stamps.length > 0) {
    const initial = await readTreeIdentity(config, mode);

    // @debt a stamped tree reports no budget or step warnings, so the commit after a passing stop never shows them again.
    if (stamps.some((line) => isReusable(line, mode, initial))) {
      return { failures: [], warnings: [] };
    }
  }

  const {
    fixes,
    checks,
    commands,
    warnings,
  } = await listSteps(config, audience);

  const fixOutcome = await runSteps(fixes, files, { concurrent: false });

  const failures = [...local.failures, ...fixOutcome.failures];

  if (mode === "staged") {
    await runGit(root, ["add", "--", ...files]);
  }

  const verified = await readTreeIdentity(config, mode);

  const [checkOutcome, commandOutcome, warningOutcome] = await Promise.all([
    runSteps(checks, files, { concurrent: true }),
    runSteps(commands, files, { concurrent: false }),
    runSteps(warnings, files, { concurrent: true }),
  ]);

  failures.push(...checkOutcome.failures, ...commandOutcome.failures);

  const duplicates = warningOutcome.failures;

  const stepWarnings = [
    ...local.warnings,
    ...fixOutcome.warnings,
    ...checkOutcome.warnings,
    ...commandOutcome.warnings,
    ...warningOutcome.warnings,
  ];

  const current = await readTreeIdentity(config, mode);

  const changed = await checkVerifiedTree(root, mode, verified, current);

  if (changed !== undefined) {
    failures.push(changed);
  }

  if (!agents) {
    return { failures, warnings: [...duplicates, ...stepWarnings] };
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
    warnings: [
      ...(await measureEntries(config, files)),
      ...duplicates,
      ...stepWarnings,
    ],
  };
}

export async function runGate(
  config: LoadedConfig,
  {
    mode,
    audience = "agents",
  }: { mode: GateMode; audience?: GateStep["audience"] },
): Promise<GateReport> {
  const resources = await config.resolve("resources");

  const lock = resolveWithin(resources.path("cache.gate"), lockFile);

  const label = lockLabels[mode];

  try {
    // @debt a gate killed by a signal releases the lock while the tools it spawned may still write files
    return await withProcessLock(
      lock,
      {
        label,
        timeout: lockTimeout,
        onWait(holder) {
          config.context.reporter.log(
            `Waiting for the ${holder.label} of process ${holder.pid}, started ${holder.started}…`,
          );
        },
      },
      () => {
        return mode === "all"
          ? checkProject(config)
          : verify(config, mode, audience);
      },
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
