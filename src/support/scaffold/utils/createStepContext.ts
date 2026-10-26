import type { JSONPath } from "jsonc-parser";

import { freeze, getOwn } from "@auaust/toolkit/object";

import { engrenage, packageJsonFile } from "#constants";
import manifest from "#package.json" with { type: "json" };
import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { readJsonValue } from "#support/json/utils/readJsonValue";
import { dependencyFields } from "#support/packageJson/constants";
import { writePackageJsonValue } from "#support/packageJson/utils/writePackageJsonValue";
import { createDeferredFiles } from "#support/scaffold/utils/createDeferredFiles";
import type { Presets } from "#config/types/Presets";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonValue } from "#support/json/types/JsonValue";
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
  const { root } = config;

  const packageJsonPath = requirePackageJson(config);

  const files = createDeferredFiles(root);

  const packageJson = relativeWithin(root, packageJsonPath);

  function readManifest(): string {
    const content = files.read(packageJson);

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
    files.write(
      packageJson,
      writePackageJsonValue(readManifest(), packageJsonPath, location, value),
    );
  }

  function hasDependency(name: PackageName): boolean {
    if (readPackageJson(["name"]) === name) {
      return true;
    }

    return dependencyFields.some((field) => {
      return readPackageJson([field, name]) !== undefined;
    });
  }

  function addDevDependency(name: PackageName) {
    if (!hasDependency(name)) {
      writePackageJson(["devDependencies", name], resolveDependencyRange(name));
    }
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
    files,
    getPresets,
    setPresets,
    multiselect: prompter.multiselect,
    readPackageJson,
    writePackageJson,
    hasDependency,
    addDevDependency,
  });
}
