import type { JSONPath } from "jsonc-parser";

import { freeze, getOwn } from "@auaust/toolkit/object";

import { engrenage, packageJsonFile } from "#constants";
import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import { jsonIndentation } from "#project/format/constants";
import { writePackageJsonValue } from "#project/package/operations/writePackageJsonValue";
import { agentNames } from "#tools/agents/constants";
import type { JsonValue } from "#foundation/json/types/JsonValue";
import type { Presets } from "#project/presets/types/Presets";
import type { Invocation } from "#project/steps/types/Invocation";
import type { Prompter } from "#project/steps/types/Prompter";
import type { StepContext } from "#project/steps/types/StepContext";
import type { Agent } from "#tools/agents/types/Agent";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";
import type { Config } from "#workflows/registry/types/Config";

import manifest from "#package.json" with { type: "json" };

const exactVersion = /^\d+\.\d+\.\d+(?:-[\w.]+)?$/;

function resolveExactVersion(name: PackageName): string {
  const version = getOwn(manifest.devDependencies, name);

  if (version === undefined || !exactVersion.test(version)) {
    throw new Error(`${engrenage} pins no exact version of ${name}`);
  }

  return version;
}

function resolveDependencyRange(name: PackageName): string {
  if (name === engrenage) {
    return `^${manifest.version}`;
  }

  const range = getOwn(manifest.peerDependencies, name);

  if (range === undefined) {
    throw new Error(`${engrenage} declares no supported range for ${name}`);
  }

  return range;
}

export function createStepContext({
  config,
  prompter,
}: {
  config: Config;
  prompter: Prompter;
}): StepContext<Config> {
  const { filesystem } = config;

  const invocations: Invocation[] = [];

  let installs = false;

  function requirePackageJson(): File {
    const path = config.packageJsonPath;

    // @debt the "No package.json found" guard is repeated in createTsdownConfig, syncChangesetConfig and createPackageJson's describeMissing; the resolved config could expose a required package.json path
    if (path === undefined) {
      throw new Error(`No ${packageJsonFile} found in ${config.root}`);
    }

    return path;
  }

  function readManifest(path: File): string {
    const content = filesystem.read(path);

    if (content === undefined) {
      throw new Error(`${path} was removed during engrenage init`);
    }

    return content;
  }

  function readPackageJson(location: JSONPath): unknown {
    const path = requirePackageJson();

    return readJsonValue(readManifest(path), path, location);
  }

  function writePackageJson(
    location: readonly [string] | readonly [string, string],
    value: JsonValue,
  ) {
    const path = requirePackageJson();

    filesystem.write(
      path,
      writePackageJsonValue(
        readManifest(path),
        path,
        location,
        value,
        jsonIndentation,
      ),
    );
  }

  function hasDependency(name: PackageName): boolean {
    return config.environment.hasDependency(name);
  }

  function addDevDependency(
    name: PackageName,
    { exact = false }: { exact?: boolean } = {},
  ) {
    if (hasDependency(name)) {
      return;
    }

    writePackageJson(
      ["devDependencies", name],
      exact ? resolveExactVersion(name) : resolveDependencyRange(name),
    );

    installs = true;
  }

  function invoke(invocation: Invocation) {
    invocations.push(invocation);
  }

  function getInvocations(): readonly Invocation[] {
    if (!installs) {
      return [...invocations];
    }

    return [
      // @debt pnpm invocations are hand-written here, in createChangesetConfigStep and in bin/engrenage/init.ts; the pnpm entry could own them
      {
        command: "pnpm",
        args: ["install"],
        interactive: false,
      },
      ...invocations,
    ];
  }

  let presets: Presets = config.presets;

  let agents: readonly Agent[] | undefined = config.agents.preferred;

  const overrides: {
    [Section in keyof Config]?: () => Config[Section];
  } = {
    presets: () => {
      return presets;
    },
    agents: () => {
      return { ...config.agents, preferred: agents };
    },
  };

  function getPresets(): Presets {
    return presets;
  }

  function setPresets(chosen: Presets) {
    presets = chosen;
  }

  function getAgents(): readonly string[] | undefined {
    return agents;
  }

  function setAgents(chosen: readonly string[]) {
    agents = agentNames.filter((name) => chosen.includes(name));
  }

  return freeze<StepContext<Config>>({
    get(section) {
      return overrides[section]?.() ?? config[section];
    },
    getAgents,
    setAgents,
    filesystem,
    getPresets,
    setPresets,
    confirm: prompter.confirm,
    select: prompter.select,
    multiselect: prompter.multiselect,
    text: prompter.text,
    readPackageJson,
    writePackageJson,
    hasDependency,
    addDevDependency,
    invoke,
    getInvocations,
  });
}
