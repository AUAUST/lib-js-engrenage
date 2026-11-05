import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { eslint, packages, prettier, typescript, vitest } from "#constants";
import { readTextFile, resolveWithin } from "#foundation/filesystem/index";
import { resolveBinary, spawnProcess } from "#foundation/processes/index";
import {
  cacheSection,
  environmentSection,
  type LoadedConfig,
} from "#project/config/index";
import { agentsSection } from "#tools/agents/index";
import {
  hashTree,
  listChangedFiles,
  listPartiallyStagedFiles,
  runGit,
  type ChangeMode,
} from "#tools/git/index";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateResult } from "#workflows/gate/types/GateResult";
import type { GateStep } from "#workflows/gate/types/GateStep";

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
    name: args.join(" "),
    run() {
      return executeCli(root, args);
    },
  };
}

async function createSteps(
  config: LoadedConfig,
): Promise<{ fixes: GateStep[]; checks: GateStep[] }> {
  const { root } = config.context;

  const environment = await config.resolve(environmentSection);
  const { gate } = await config.resolve(agentsSection);

  const fixes: GateStep[] = [];
  const checks: GateStep[] = [];

  if (environment.hasDependency(eslint)) {
    fixes.push({
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

  for (const command of gate.commands) {
    checks.push({
      name: command,
      run() {
        return execute(root, "sh", ["-c", command]);
      },
    });
  }

  return { fixes, checks };
}

async function runSteps(
  steps: readonly GateStep[],
  files: Files,
): Promise<GateFailure[]> {
  const failures: GateFailure[] = [];

  for (const step of steps) {
    let result: GateResult;

    try {
      result = await step.run(files);
    } catch (error) {
      result = {
        ok: false,
        output: error instanceof Error ? error.message : String(error),
      };
    }

    if (!result.ok) {
      failures.push({ step: step.name, output: result.output });
    }
  }

  return failures;
}

async function readStamps(file: string): Promise<readonly string[]> {
  const content = await readTextFile(file);

  return content?.split("\n").filter((line) => line !== "") ?? [];
}

// @debt ESLint runs only on changed files, so a type change that breaks a dependent's type-aware rule passes until CI's full `lint --no-cache`
export async function runGate(
  config: LoadedConfig,
  { mode }: { mode: ChangeMode },
): Promise<readonly GateFailure[]> {
  const { root } = config.context;

  if (mode === "staged") {
    const partial = await listPartiallyStagedFiles(root);

    if (partial.length > 0) {
      return [
        {
          step: "staging",
          output: `Stage the whole file, since the fixes would stage its unstaged hunks:\n${partial.join("\n")}`,
        },
      ];
    }
  }

  const cache = await config.resolve(cacheSection);

  const stamp = resolveWithin(root, cache.for(stampName), stampFile);

  const stamps = await readStamps(stamp);

  if (stamps.includes(await hashTree(root, mode))) {
    return [];
  }

  const files = await listChangedFiles(root, mode);

  if (files.length === 0) {
    return [];
  }

  const { fixes, checks } = await createSteps(config);

  const failures = await runSteps(fixes, files);

  if (mode === "staged") {
    await runGit(root, ["add", "--", ...files]);
  }

  failures.push(...(await runSteps(checks, files)));

  if (failures.length === 0) {
    await mkdir(dirname(stamp), { recursive: true });

    await writeFile(
      stamp,
      `${[...stamps, await hashTree(root, mode)].slice(-stampLimit).join("\n")}\n`,
    );
  }

  return failures;
}
