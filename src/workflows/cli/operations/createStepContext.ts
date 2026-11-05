import type { JSONPath } from "jsonc-parser";

import { freeze, getOwn } from "@auaust/toolkit/object";

import { engrenage, packageJsonFile } from "#constants";
import { readJsonValue, type JsonValue } from "#foundation/json/index";
import { jsonIndentation } from "#project/format/constants";
import { writePackageJsonValue } from "#project/package/index";
import {
  resolveTraits,
  type Preset,
  type ResolvedTraits,
} from "#project/presets/index";
import { agentNames } from "#tools/agents/constants";
import type { OptionContext } from "#foundation/options/index";
import type { Invocation, Prompter, StepContext } from "#project/steps/index";
import type { Agent } from "#tools/agents/index";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";
import type { Config } from "#workflows/registry/index";

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

export async function createStepContext({
  config,
  prompter,
}: {
  config: OptionContext<Config>;
  prompter: Prompter;
}): Promise<StepContext<Config>> {
  const filesystem = await config.get("filesystem");

  const invocations: Invocation[] = [];

  let installs = false;

  async function requirePackageJson(): Promise<File> {
    const path = await config.get("packageJsonPath");

    // @debt the "No package.json found" guard is repeated in createTsdownConfig, syncChangesetConfig and createPackageJson's describeMissing; the resolved config could expose a required package.json path
    if (path === undefined) {
      throw new Error(
        `No ${packageJsonFile} found in ${await config.get("root")}`,
      );
    }

    return path;
  }

  async function readManifest(path: File): Promise<string> {
    const content = await filesystem.read(path);

    if (content === undefined) {
      throw new Error(`${path} was removed during engrenage init`);
    }

    return content;
  }

  async function readPackageJson(location: JSONPath): Promise<unknown> {
    const path = await requirePackageJson();

    return readJsonValue(await readManifest(path), path, location);
  }

  async function writePackageJson(
    location: readonly [string] | readonly [string, string],
    value: JsonValue,
  ) {
    const path = await requirePackageJson();

    await filesystem.write(
      path,
      writePackageJsonValue(
        await readManifest(path),
        path,
        location,
        value,
        jsonIndentation,
      ),
    );
  }

  async function hasDependency(name: PackageName): Promise<boolean> {
    const environment = await config.get("environment");

    return environment.hasDependency(name);
  }

  async function addDevDependency(
    name: PackageName,
    { exact = false }: { exact?: boolean } = {},
  ) {
    if (await hasDependency(name)) {
      return;
    }

    await writePackageJson(
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

  let preset: Preset | undefined = await config.get("preset");

  const resolvedAgents = await config.get("agents");

  let agents: readonly Agent[] | undefined = resolvedAgents.preferred;

  const overrides: {
    [Section in keyof Config]?: () =>
      Config[Section] | Promise<Config[Section]>;
  } = {
    preset: () => {
      return preset;
    },
    traits: getTraits,
    agents: async () => {
      return { ...(await config.get("agents")), preferred: agents };
    },
  };

  function getPreset(): Preset | undefined {
    return preset;
  }

  async function getTraits(): Promise<ResolvedTraits> {
    return resolveTraits(preset, await config.get("traitAdjustments"));
  }

  function setPreset(chosen: Preset | undefined) {
    preset = chosen;
  }

  function getAgents(): readonly string[] | undefined {
    return agents;
  }

  function setAgents(chosen: readonly string[]) {
    agents = agentNames.filter((name) => chosen.includes(name));
  }

  return freeze<StepContext<Config>>({
    async get(section) {
      return (await overrides[section]?.()) ?? config.get(section);
    },
    getAgents,
    setAgents,
    filesystem,
    getPreset,
    getTraits,
    setPreset,
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
