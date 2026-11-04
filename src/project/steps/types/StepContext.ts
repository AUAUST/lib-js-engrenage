import type { JSONPath } from "jsonc-parser";

import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { JsonValue } from "#foundation/json/types/JsonValue";
import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { Preset } from "#project/presets/types/Preset";
import type { ResolvedTraits } from "#project/presets/types/ResolvedTraits";
import type { Invocation } from "#project/steps/types/Invocation";
import type { Prompter } from "#project/steps/types/Prompter";
import type { PackageName } from "#types/PackageName";

export interface StepContext<Sections = object> extends Pick<
  Prompter,
  "confirm" | "select" | "multiselect" | "text"
> {
  get: OptionContext<Sections>["get"];
  readonly filesystem: Filesystem;
  getAgents(): readonly string[] | undefined;
  setAgents(chosen: readonly string[]): void;
  getPreset(): Preset | undefined;
  getTraits(): ResolvedTraits;
  setPreset(chosen: Preset | undefined): void;
  readPackageJson(location: JSONPath): unknown;
  writePackageJson(
    location: readonly [string] | readonly [string, string],
    value: JsonValue,
  ): void;
  hasDependency(name: PackageName): boolean;
  addDevDependency(name: PackageName, options?: { exact?: boolean }): void;
  invoke(invocation: Invocation): void;
  getInvocations(): readonly Invocation[];
}
