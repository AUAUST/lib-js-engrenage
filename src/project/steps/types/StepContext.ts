import type { JSONPath } from "jsonc-parser";

import type { Filesystem } from "#foundation/filesystem/index";
import type { JsonValue } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { Preset, ResolvedTraits } from "#project/presets/index";
import type { Invocation } from "#project/steps/types/Invocation";
import type { Prompter } from "#project/steps/types/Prompter";
import type { PackageName } from "#types/PackageName";

export interface StepContext
  extends
    LoadedConfig,
    Pick<Prompter, "confirm" | "select" | "multiselect" | "text"> {
  readonly filesystem: Filesystem;
  getAgents(): readonly string[] | undefined;
  setAgents(chosen: readonly string[]): void;
  getPreset(): Preset | undefined;
  getTraits(): Promise<ResolvedTraits>;
  setPreset(chosen: Preset | undefined): void;
  readPackageJson(location: JSONPath): Promise<unknown>;
  writePackageJson(
    location: readonly [string] | readonly [string, string],
    value: JsonValue,
  ): Promise<void>;
  hasDependency(name: PackageName): Promise<boolean>;
  addDevDependency(
    name: PackageName,
    options?: { exact?: boolean },
  ): Promise<void>;
  invoke(invocation: Invocation): void;
  getInvocations(): readonly Invocation[];
}
