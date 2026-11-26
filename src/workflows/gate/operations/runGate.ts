import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { map } from "@auaust/toolkit/array";
import { sum } from "@auaust/toolkit/math";
import { measureAsync } from "@auaust/toolkit/time";

import { readTextFile, resolveWithin } from "#foundation/filesystem/index";
import { LockTimeoutError } from "#foundation/processes/errors/LockTimeoutError";
import { withProcessLock } from "#foundation/processes/index";
import {
  listChangedFiles,
  listLocalFiles,
  listPartiallyStagedFiles,
  listRemovedFiles,
  runGit,
  type ChangeMode,
} from "#tools/git/index";
import { listLocalFilePatterns } from "#tools/metalbrain/index";
import { checkProject } from "#workflows/gate/operations/checkProject";
import { checkVerifiedTree } from "#workflows/gate/operations/checkVerifiedTree";
import { listStageSteps } from "#workflows/gate/operations/listStageSteps";
import { readTreeIdentity } from "#workflows/gate/operations/readTreeIdentity";
import { runGenerateStage } from "#workflows/gate/operations/runGenerateStage";
import { runSteps } from "#workflows/gate/operations/runSteps";
import { coverSteps } from "#workflows/gate/utils/coverSteps";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { GateStep } from "#workflows/gate/apis/GateStep";
import type { GateChanges } from "#workflows/gate/types/GateChanges";
import type { GateGroupTiming } from "#workflows/gate/types/GateGroupTiming";
import type { GateMode } from "#workflows/gate/types/GateMode";
import type { GateRunReport } from "#workflows/gate/types/GateRunReport";
import type { GateStepTiming } from "#workflows/gate/types/GateStepTiming";
import type { GateWarning } from "#workflows/gate/types/GateWarning";
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

async function listLocalSteps(
  config: LoadedConfig,
  mode: ChangeMode,
): Promise<GateStep[]> {
  if (mode !== "staged") {
    return [];
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

  return [local];
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
      output: `Unstaged changes, which --worktree checks:\n${unstaged.join("\n")}`,
    },
  ];
}

// @debt ESLint runs only on changed files, so a type change that breaks a dependent's type-aware rule passes until `gate --all`
async function verify(
  config: LoadedConfig,
  mode: ChangeMode,
  audience: GateStep["audience"],
  groups: GateGroupTiming[],
): Promise<Omit<GateRunReport, "timings">> {
  const { root } = config.context;

  const [edited, removed] = await Promise.all([
    listChangedFiles(root, mode),
    listRemovedFiles(root, mode),
  ]);

  const scope = edited.length + removed.length;

  const localSteps = await listLocalSteps(config, mode);

  const local = await runSteps(
    localSteps,
    { files: edited, removed: [] },
    { group: "local", concurrent: false },
  );

  groups.push(local.timing);

  if (local.failures.length > 0) {
    return { ...local, checked: coverSteps([localSteps], scope) };
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
        checked: coverSteps([localSteps], scope),
      };
    }
  }

  if (scope === 0) {
    return {
      failures: [],
      warnings: await warnUnstagedChanges(root, mode),
      checked: coverSteps([localSteps], scope),
    };
  }

  const agents = audience === "agents";

  const resources = await config.resolve("resources");

  const stamp = resolveWithin(resources.path("cache.gate"), stampFile);

  const stamps = agents ? await readStamps(stamp) : [];

  if (stamps.length > 0) {
    const {
      result: initial,
      duration,
    } = await measureAsync(readTreeIdentity, config, mode);

    groups.push({
      name: "stamp",
      duration,
      steps: [{ name: "lookup", duration }],
    });

    // @debt a stamped tree reports no duplicate or step warnings, so the commit after a passing stop never shows them again.
    if (stamps.some((line) => isReusable(line, mode, initial))) {
      return {
        failures: [],
        warnings: [],
        checked: {
          steps: [],
          scope,
          reused: true,
        },
      };
    }
  }

  const {
    generate,
    fixes,
    checks,
    commands,
    warnings,
  } = await listStageSteps(config, audience);

  const generateOutcome = await runGenerateStage(root, mode, generate, {
    files: edited,
    removed,
  });

  groups.push(generateOutcome.timing);

  if (generateOutcome.failures.length > 0) {
    return {
      failures: [...local.failures, ...generateOutcome.failures],
      warnings: [...local.warnings, ...generateOutcome.warnings],
      checked: coverSteps([localSteps, generate], scope),
    };
  }

  const files = generate.length === 0
    ? edited
    : await listChangedFiles(root, mode);

  if (files.length === 0) {
    return {
      ...generateOutcome,
      checked: coverSteps([localSteps, generate], scope),
    };
  }

  const changes: GateChanges = { files, removed };

  const fixOutcome = await runSteps(fixes, changes, {
    group: "fixes",
    concurrent: false,
  });

  groups.push(fixOutcome.timing);

  const tree: GateStepTiming[] = [];

  async function timeTree<Result>(
    name: string,
    task: () => Promise<Result>,
  ): Promise<Result> {
    const { result, duration } = await measureAsync(task);

    tree.push({ name, duration });

    return result;
  }

  const failures = [
    ...local.failures,
    ...generateOutcome.failures,
    ...fixOutcome.failures,
  ];

  if (mode === "staged") {
    await timeTree("staging", () => runGit(root, ["add", "--", ...files]));
  }

  const verified = await timeTree("identity", () => {
    return readTreeIdentity(config, mode);
  });

  const [checkOutcome, commandOutcome, warningOutcome] = await Promise.all([
    runSteps(checks, changes, { group: "checks", concurrent: true }),
    runSteps(commands, changes, { group: "commands", concurrent: false }),
    runSteps(warnings, changes, { group: "warnings", concurrent: true }),
  ]);

  groups.push(
    checkOutcome.timing,
    commandOutcome.timing,
    warningOutcome.timing,
  );

  failures.push(...checkOutcome.failures, ...commandOutcome.failures);

  const duplicates = warningOutcome.failures;

  const stepWarnings = [
    ...local.warnings,
    ...generateOutcome.warnings,
    ...fixOutcome.warnings,
    ...checkOutcome.warnings,
    ...commandOutcome.warnings,
    ...warningOutcome.warnings,
  ];

  const changed = await timeTree("verification", async () => {
    const current = await readTreeIdentity(config, mode);

    return checkVerifiedTree(root, mode, verified, current);
  });

  if (changed !== undefined) {
    failures.push(changed);
  }

  if (agents && failures.length === 0) {
    await timeTree("stamp", async () => {
      await mkdir(dirname(stamp), { recursive: true });

      await writeFile(
        stamp,
        `${[...stamps, formatStamp(mode, verified)].slice(-stampLimit).join("\n")}\n`,
      );
    });
  }

  groups.push({
    name: "tree",
    duration: sum(...map(tree, ({ duration }) => duration)),
    steps: tree,
  });

  return {
    failures,
    warnings: [...duplicates, ...stepWarnings],
    checked: coverSteps(
      [localSteps, generate, fixes, checks, commands, warnings],
      scope,
    ),
  };
}

export async function runGate(
  config: LoadedConfig,
  {
    mode,
    audience = "agents",
  }: { mode: GateMode; audience?: GateStep["audience"] },
): Promise<GateRunReport> {
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
      async () => {
        const groups: GateGroupTiming[] = [];

        const { result, duration } = await measureAsync(() => {
          return mode === "all"
            ? checkProject(config, groups)
            : verify(config, mode, audience, groups);
        });

        return {
          ...result,
          timings: { groups, duration },
        };
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
      checked: {
        steps: [],
        scope: 0,
        reused: false,
      },
      timings: {
        groups: [],
        duration: 0,
      },
    };
  }
}
