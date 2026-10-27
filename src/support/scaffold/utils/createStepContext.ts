import type { JSONPath } from "jsonc-parser";

import { freeze, getOwn } from "@auaust/toolkit/object";

import { engrenage, packageJsonFile } from "#constants";
import manifest from "#package.json" with { type: "json" };
import { readJsonValue } from "#support/json/utils/readJsonValue";
import { writePackageJsonValue } from "#support/packageJson/utils/writePackageJsonValue";
import type { Presets } from "#config/types/Presets";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonValue } from "#support/json/types/JsonValue";
import type { Invocation } from "#support/scaffold/types/Invocation";
import type { Prompter } from "#support/scaffold/types/Prompter";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";

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

function requirePackageJson({ root, packageJsonPath }: ResolvedConfig): File {
  if (packageJsonPath === undefined) {
    throw new Error(
      `No ${packageJsonFile} found in ${root}; create one before running engrenage init`,
    );
  }

  return packageJsonPath;
}

export function createStepContext({
  config,
  prompter,
}: {
  config: ResolvedConfig;
  prompter: Prompter;
}) {
  const { filesystem } = config;

  const packageJsonPath = requirePackageJson(config);

  const invocations: Invocation[] = [];

  let installs = false;

  function readManifest(): string {
    const content = filesystem.read(packageJsonPath);

    if (content === undefined) {
      throw new Error(`${packageJsonPath} was removed during engrenage init`);
    }

    return content;
  }

  function readPackageJson(location: JSONPath): unknown {
    return readJsonValue(readManifest(), packageJsonPath, location);
  }

  function writePackageJson(
    location: readonly [string] | readonly [string, string],
    value: JsonValue,
  ) {
    filesystem.write(
      packageJsonPath,
      writePackageJsonValue(readManifest(), packageJsonPath, location, value),
    );
  }

  function hasDependency(name: PackageName): boolean {
    return config.environment.hasDependency(name);
  }

  function addDevDependency(name: PackageName) {
    if (!hasDependency(name)) {
      writePackageJson(["devDependencies", name], resolveDependencyRange(name));

      installs = true;
    }
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

  return freeze({
    config,
    filesystem,
    getPresets,
    setPresets,
    multiselect: prompter.multiselect,
    readPackageJson,
    writePackageJson,
    hasDependency,
    addDevDependency,
    invoke,
    getInvocations,
  });
}
