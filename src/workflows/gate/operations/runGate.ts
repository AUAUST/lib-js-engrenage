import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { filter, map } from "@auaust/primitive-kit/arrays";

import {
  eslint,
  jscpd,
  packages,
  prettier,
  typescript,
  vitest,
} from "#constants";
import { readTextFile, resolveWithin } from "#foundation/filesystem/index";
import { resolveBinary, spawnProcess } from "#foundation/processes/index";
import { cacheSection } from "#project/cache/index";
import { environmentSection } from "#project/package/index";
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
import { findClones, formatClone } from "#tools/jscpd/index";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateReport } from "#workflows/gate/types/GateReport";
import type { GateResult } from "#workflows/gate/types/GateResult";
import type { GateStep } from "#workflows/gate/types/GateStep";
import type { GateWarning } from "#workflows/gate/types/GateWarning";

const stampName = "gate";

const stampFile = "passed";

const stampLimit = 20;

async function execute(
  root: Directory,
  command: string,
  args: readonly string[],
): Promise<GateResult> {
  const { status, stdout, stderr, error } = await spawnProcess(command, args, {
    cwd: root,
  });

  return {
    ok: error === undefined && status === 0,
    output: error === undefined ? stdout + stderr : error.message,
  };
}

async function executeBinary(
  root: Directory,
  packageName: KnownPackageName,
  args: readonly string[],
): Promise<GateResult> {
  return execute(root, process.execPath, [
    await resolveBinary(root, packageName, packageName),
    ...args,
  ]);
}

function executeCli(
  root: Directory,
  args: readonly string[],
): Promise<GateResult> {
  const entry = process.argv[1];

  if (entry === undefined) {
    throw new Error("Cannot find the running engrenage CLI");
  }

  return execute(root, process.execPath, [entry, ...args]);
}

function createCliStep(root: Directory, args: readonly string[]): GateStep {
  return {
    audience: "agents",
    name: args.join(" "),
    run() {
      return executeCli(root, args);
    },
  };
}

async function createSteps(config: LoadedConfig): Promise<{
  fixes: GateStep[];
  checks: GateStep[];
  commands: GateStep[];
  warnings: GateStep[];
}> {
  const { root } = config.context;

  const environment = await config.resolve(environmentSection);

  const { gate } = await config.resolve(agentsSection);

  const fixes: GateStep[] = [];
  const checks: GateStep[] = [];

  if (environment.hasDependency(eslint)) {
    fixes.push({
      audience: "agents",
      name: eslint,
      run(files) {
        return executeBinary(root, packages.eslint, [
          "--fix",
          "--no-cache",
          "--no-warn-ignored",
          "--",
          ...files,
        ]);
      },
    });
  }

  fixes.push({
    audience: "agents",
    name: prettier,
    run(files) {
      return executeBinary(root, packages.prettier, [
        "--write",
        "--ignore-unknown",
        "--",
        ...files,
      ]);
    },
  });

  if (environment.hasDependency(typescript)) {
    checks.push(createCliStep(root, ["typecheck"]));
  }

  checks.push(
    createCliStep(root, ["structure", "--check"]),
    createCliStep(root, ["sync", "--check"]),
  );

  if (environment.hasDependency(vitest)) {
    checks.push({
      audience: "agents",
      name: "vitest related",
      run(files) {
        return executeBinary(root, packages.vitest, [
          "related",
          "--run",
          "--passWithNoTests",
          ...files,
        ]);
      },
    });
  }

  const warnings: GateStep[] = [];

  // @debt duplicated code only warns until the project's existing clones are cleaned up; it should then fail the gate like the other checks
  if (environment.hasDependency(jscpd)) {
    warnings.push({
      audience: "agents",
      name: jscpd,
      async run(files) {
        const clones = await findClones(config, files);

        return {
          ok: clones.length === 0,
          output: map(clones, formatClone).join("\n"),
        };
      },
    });
  }

  const commands = map(gate.commands, (command): GateStep => {
    return {
      audience: "agents",
      name: command,
      run() {
        return execute(root, "sh", ["-c", command]);
      },
    };
  });

  return {
    fixes,
    checks,
    commands,
    warnings,
  };
}

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

// @debt ESLint runs only on changed files, so a type change that breaks a dependent's type-aware rule passes until CI's full `lint --no-cache`
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

  const { fixes, checks, commands, warnings } = await createSteps(config);

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
