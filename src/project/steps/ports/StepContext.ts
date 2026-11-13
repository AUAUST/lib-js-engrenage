import type { JSONPath } from "jsonc-parser";

import type { Filesystem } from "#foundation/filesystem/index";
import type { JsonValue } from "#foundation/json/index";
import type {
  ConfigKey,
  ConfigSections,
  LoadedConfig,
} from "#project/config/index";
import type { ResolvedTraits } from "#project/presets/index";
import type { Prompter } from "#project/steps/ports/Prompter";
import type { Invocation } from "#project/steps/types/Invocation";
import type { PackageName } from "#types/PackageName";

/**
 * @experimental
 */
export interface StepContext
  extends
    LoadedConfig,
    Pick<Prompter, "confirm" | "select" | "multiselect" | "text"> {
  /**
   * The config's staging filesystem: steps write through it, and reads see the
   * writes earlier steps staged.
   */
  readonly filesystem: Filesystem;
  /**
   * The preferred agents chosen so far, starting from the configured ones;
   * `undefined` while neither the config nor a step chose any.
   */
  getAgents(): readonly string[] | undefined;
  /**
   * Replaces the preferred agents with the names in `chosen` that an active agent
   * runtime contributes, dropping the others; later `resolve("agents")` calls
   * return them.
   */
  setAgents(chosen: readonly string[]): void;
  /**
   * The name of the preset chosen so far, starting from the configured one;
   * `undefined` when there is none.
   */
  getPreset(): string | undefined;
  /**
   * Resolves the traits of the preset chosen so far with the configured trait
   * adjustments; the adjustments alone when no preset is chosen.
   */
  getTraits(): Promise<ResolvedTraits>;
  /**
   * Replaces the chosen preset, `undefined` choosing none; later
   * `resolve("preset")`, `resolve("traits")` and `getTraits` calls follow it,
   * rejecting when no registered preset has that name.
   */
  setPreset(chosen: string | undefined): void;
  // @debt `setKey("preset", …)` bypasses the preset `getPreset` reads; overriding one key should never desync another accessor
  /**
   * Makes later `resolve(key)` calls return `value` instead of the configured
   * section; an `undefined` value falls back to the configured section.
   */
  setKey<Key extends ConfigKey>(
    key: Key,
    value: NoInfer<ConfigSections[Key]>,
  ): void;
  /**
   * Reads the value at `location` in the package manifest as staged so far,
   * `undefined` when absent. Rejects when the project has no package manifest.
   */
  readPackageJson(location: JSONPath): Promise<unknown>;
  /**
   * Stages `value` at a top-level property or a key inside one, keeping the
   * manifest's formatting; a new property takes its place in the canonical
   * manifest order, a new key its alphabetical place. Rejects when the project
   * has no package manifest.
   */
  writePackageJson(
    location: readonly [string] | readonly [string, string],
    value: JsonValue,
  ): Promise<void>;
  /**
   * Tells whether the package manifest declares `name` as a dependency of any
   * kind or names the package itself `name`.
   */
  hasDependency(name: PackageName): Promise<boolean>;
  /**
   * Stages `name` as a dev dependency unless `hasDependency` already holds, at the
   * exact version engrenage pins with `exact`, otherwise at the range engrenage
   * supports, and schedules an install ahead of every invocation. Rejects when
   * engrenage pins or supports no version of `name`.
   */
  addDevDependency(
    name: PackageName,
    options?: { exact?: boolean },
  ): Promise<void>;
  /**
   * Queues a command to run once the staged writes are flushed, after the commands
   * queued before it.
   */
  invoke(invocation: Invocation): void;
  /**
   * The queued commands in order, preceded by a `pnpm install` when a dev
   * dependency was added.
   */
  getInvocations(): readonly Invocation[];
}
