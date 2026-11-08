import { map } from "@auaust/primitive-kit/arrays";

import {
  eslint,
  jscpd,
  packages,
  prettier,
  typescript,
  vitest,
} from "#constants";
import { resolveBinary, spawnProcess } from "#foundation/processes/index";
import { environmentSection } from "#project/package/index";
import { agentsSection } from "#tools/agents/index";
import { reportClones } from "#tools/jscpd/index";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { GateResult } from "#workflows/gate/types/GateResult";
import type { GateStep } from "#workflows/gate/types/GateStep";

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

export async function createGateSteps(config: LoadedConfig): Promise<{
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
          "--no-warn-ignored",
          "--",
          ...files,
        ]);
      },
    });
  }

  // @debt the only lint verdict is `eslint --fix`, which runs before `prettier --write` rewrites the files, so a formatting change that breaks a lint rule passes the gate
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
        const report = await reportClones(config, files);

        return { ok: report === undefined, output: report ?? "" };
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
