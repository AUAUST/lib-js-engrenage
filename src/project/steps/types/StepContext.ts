import type { JSONPath } from "jsonc-parser";

import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { JsonValue } from "#foundation/json/types/JsonValue";
import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { Presets } from "#project/presets/types/Presets";
import type { Invocation } from "#project/steps/types/Invocation";
import type { Prompter } from "#project/steps/types/Prompter";
// @debt reaches into tools/agents, a higher layer than project; the step context could carry the chosen agents as plain names
import type { Agent } from "#tools/agents/types/Agent";
import type { PackageName } from "#types/PackageName";

export interface StepContext<Sections = object> extends Pick<
  Prompter,
  "confirm" | "select" | "multiselect" | "text"
> {
  get: OptionContext<Sections>["get"];
  readonly filesystem: Filesystem;
  getAgents(): readonly Agent[] | undefined;
  setAgents(chosen: Agent[]): void;
  getPresets(): Presets;
  setPresets(chosen: Presets): void;
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
