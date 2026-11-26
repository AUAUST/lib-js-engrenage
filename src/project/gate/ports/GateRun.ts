import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/ports/GateResult";
import type { Files } from "#types/Files";

// @debt the changes reach a step as positional `files` and `removed` while `workflows/gate` carries them as one `GateChanges` value: one shape in this contract would serve both

/**
 * Runs a step on the changed `files`, those the changes add, modify or rename
 * to, given the `removed` files the changes delete or rename away.
 *
 * @experimental
 */
export type GateRun = (
  config: LoadedConfig,
  files: Files,
  removed: Files,
) => Promise<GateResult>;
