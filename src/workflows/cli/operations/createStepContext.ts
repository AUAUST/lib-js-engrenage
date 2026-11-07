import type { JSONPath } from "jsonc-parser";

import { freeze, getOwn } from "@auaust/toolkit/object";

import { engrenage, packageJsonFile } from "#constants";
import { readJsonValue, type JsonValue } from "#foundation/json/index";
import { jsonIndentation } from "#project/format/constants";
import {
  environmentSection,
  packageJsonPathSection,
  writePackageJsonValue,
} from "#project/package/index";
import {
  presetSection,
  resolveTraits,
  traitAdjustmentsSection,
  traitsSection,
  type Preset,
  type ResolvedTraits,
} from "#project/presets/index";
import { agentNames } from "#tools/agents/constants";
import { agentsSection, type Agent } from "#tools/agents/index";
import type { Section } from "#foundation/options/index";
import type { LoadedConfig } from "#project/config/index";
import type { Invocation, Prompter, StepContext } from "#project/steps/index";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";

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
  config: LoadedConfig;
  prompter: Prompter;
}): Promise<StepContext> {
  const filesystem = config.context.filesystem;

  const invocations: Invocation[] = [];

  let installs = false;

  async function requirePackageJson(): Promise<File> {
    const path = await config.resolve(packageJsonPathSection);

    // @debt the "No package.json found" guard is repeated in createTsdownConfig, syncChangesetConfig and createPackageJson's describeMissing; the resolved config could expose a required package.json path
    if (path === undefined) {
      throw new Error(`No ${packageJsonFile} found in ${config.context.root}`);
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
    const environment = await config.resolve(environmentSection);

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

  let preset: Preset | undefined = await config.resolve(presetSection);

  const resolvedAgents = await config.resolve(agentsSection);

  let agents: readonly Agent[] | undefined = resolvedAgents.preferred;

  const overrides = new Map<Section, () => unknown>();

  function override<Output>(
    section: Section<Output>,
    resolve: () => Output | Promise<Output>,
  ) {
    overrides.set(section, resolve);
  }

  override(presetSection, () => {
    return preset;
  });

  override(traitsSection, getTraits);

  override(agentsSection, async () => {
    return { ...(await config.resolve(agentsSection)), preferred: agents };
  });

  async function resolve<Output>(section: Section<Output>): Promise<Output> {
    const overridden = (await overrides.get(section)?.()) as Output | undefined;

    return overridden ?? config.resolve(section);
  }

  function getPreset(): Preset | undefined {
    return preset;
  }

  async function getTraits(): Promise<ResolvedTraits> {
    return resolveTraits(preset, await config.resolve(traitAdjustmentsSection));
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

  return freeze<StepContext>({
    resolve,
    context: config.context,
    validate: config.validate,
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
