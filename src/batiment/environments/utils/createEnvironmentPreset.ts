import { freeze } from "@auaust/toolkit/object";

import type { EnvironmentPreset } from "#batiment/environments/ports/EnvironmentPreset";

/**
 * Creates an environment preset, for a project or an extension to contribute the
 * known configurations its environments register by name.
 */
export function createEnvironmentPreset<const Preset extends EnvironmentPreset>(
  preset: Preset,
): Readonly<Preset> {
  return freeze({ ...preset });
}
