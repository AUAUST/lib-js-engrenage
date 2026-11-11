import type { JSONPath } from "jsonc-parser";

import { map } from "@auaust/primitive-kit/arrays";
import { freeze, getOwn } from "@auaust/toolkit/object";

import { engrenage, packageJsonFile } from "#constants";
import { readJsonValue, type JsonValue } from "#foundation/json/index";
import { jsonIndentation } from "#project/format/constants";
import { writePackageJsonValue } from "#project/package/index";
import { resolveTraits, type ResolvedTraits } from "#project/presets/index";
import { filterAgents, type Agent } from "#tools/agents/index";
import { createPnpmInvocation } from "#tools/pnpm/index";
import type {
  ConfigKey,
  ConfigSections,
  LoadedConfig,
} from "#project/config/index";
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
    const path = await config.resolve("packageJsonPath");

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
    const environment = await config.resolve("environment");

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

    return [createPnpmInvocation(["install"]), ...invocations];
  }

  const { registry } = config.context;

  const configured = await config.resolve("preset");

  let preset = configured === false ? undefined : configured.name;

  const resolvedAgents = await config.resolve("agents");

  const runtimes = await registry.contributions("agents.runtimes", config);

  const runtimeNames = map(runtimes, ({ entry }) => entry.name);

  let agents: readonly Agent[] | undefined = resolvedAgents.preferred;

  const overrides = new Map<ConfigKey, () => unknown>();

  function override<Key extends ConfigKey>(
    key: Key,
    resolve: () => ConfigSections[Key] | Promise<ConfigSections[Key]>,
  ) {
    overrides.set(key, resolve);
  }

  override("preset", selectPreset);

  override("traits", getTraits);

  override("agents", async () => {
    return { ...(await config.resolve("agents")), preferred: agents };
  });

  // @debt an override resolving to undefined falls back to the config value, so an override cannot clear a configured key
  function resolve<Key extends ConfigKey>(
    key: Key,
  ): Promise<ConfigSections[Key]>;
  async function resolve(key: ConfigKey): Promise<unknown> {
    const overridden: unknown = await overrides.get(key)?.();

    return overridden ?? config.resolve(key);
  }

  async function selectPreset(): Promise<ConfigSections["preset"]> {
    if (preset === undefined) {
      return false;
    }

    const { entry } = await registry.select("presets", preset, config);

    return entry;
  }

  function getPreset(): string | undefined {
    return preset;
  }

  async function getTraits(): Promise<ResolvedTraits> {
    const selected = await selectPreset();

    return resolveTraits(
      selected === false ? [] : selected.traits,
      await config.resolve("traits.adjustments"),
    );
  }

  function setPreset(chosen: string | undefined) {
    preset = chosen;
  }

  function setKey<Key extends ConfigKey>(key: Key, value: ConfigSections[Key]) {
    override(key, () => {
      return value;
    });
  }

  function getAgents(): readonly string[] | undefined {
    return agents;
  }

  function setAgents(chosen: readonly string[]) {
    agents = filterAgents(chosen, runtimeNames);
  }

  return freeze<StepContext>({
    resolve,
    input: config.input,
    context: config.context,
    validate: config.validate,
    forget: config.forget,
    getAgents,
    setAgents,
    filesystem,
    getPreset,
    getTraits,
    setPreset,
    setKey,
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
