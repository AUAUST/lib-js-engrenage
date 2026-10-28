import type { JSONPath } from "jsonc-parser";

import { freeze, getOwn } from "@auaust/toolkit/object";

import { engrenage, packageJsonFile } from "#constants";
import { readJsonValue } from "#support/json/utils/readJsonValue";
import { writePackageJsonValue } from "#support/packageJson/utils/writePackageJsonValue";
import type { Agent } from "#agents/types/Agent";
import type { Presets } from "#config/types/Presets";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonValue } from "#support/json/types/JsonValue";
import type { Invocation } from "#support/scaffold/types/Invocation";
import type { Prompter } from "#support/scaffold/types/Prompter";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";

import manifest from "#package.json" with { type: "json" };

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
  config: ResolvedConfig;
  prompter: Prompter;
}) {
  const { filesystem } = config;

  const invocations: Invocation[] = [];

  let installs = false;

  function requirePackageJson(): File {
    const path = config.packageJsonPath;

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
      writePackageJsonValue(readManifest(path), path, location, value),
    );
  }

  function hasDependency(name: PackageName): boolean {
    return config.environment.hasDependency(name);
  }

  function addDevDependency(name: PackageName) {
    if (hasDependency(name)) {
      return;
    }

    writePackageJson(["devDependencies", name], resolveDependencyRange(name));

    installs = true;
  }

  function invoke(invocation: Invocation) {
    invocations.push(invocation);
  }

  function getInvocations(): ReadonlyArray<Invocation> {
    if (!installs) {
      return [...invocations];
    }

    return [
      {
        command: "pnpm",
        args: ["install"],
        interactive: false,
      },
      ...invocations,
    ];
  }

  let presets: Presets = config.presets;

  function getPresets(): Presets {
    return presets;
  }

  function setPresets(chosen: Presets) {
    presets = chosen;
  }

  let agents = config.agents.preferred;

  function getAgents(): readonly Agent[] | undefined {
    return agents;
  }

  function setAgents(chosen: Agent[]) {
    agents = chosen;
  }

  return freeze({
    get config() {
      return {
        ...config,
        agents: {
          ...config.agents,
          preferred: agents,
        },
      };
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
