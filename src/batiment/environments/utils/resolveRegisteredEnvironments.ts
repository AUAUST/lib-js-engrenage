import { freeze } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import type { EnvironmentPreset } from "#batiment/environments/ports/EnvironmentPreset";
import type { EnvironmentRegistration } from "#batiment/environments/types/EnvironmentRegistration";
import type { RegisteredEnvironment } from "#batiment/environments/types/RegisteredEnvironment";

/**
 * Pairs each registration with the preset it names, its languages, execution
 * fields and bundler pass tuned.
 *
 * @throws When a registration names a preset absent from `presets`.
 */
export function resolveRegisteredEnvironments(
  presets: readonly EnvironmentPreset[],
  registrations: readonly EnvironmentRegistration[],
): readonly RegisteredEnvironment[] {
  const byName = new Map(presets.map((preset) => [preset.name, preset]));

  return freeze(
    registrations.map((registration) => {
      const preset = byName.get(registration.preset);

      if (preset === undefined) {
        throw new Error(
          `The environment ${registration.name} names the environment preset "${registration.preset}", which no active extension contributes`,
        );
      }

      const bundled = registration.bundled ?? preset.bundled;

      return freeze({
        registration,
        preset,
        languages: registration.languages ?? preset.languages ?? [],
        execution: freeze({
          ...preset.execution,
          ...registration.execution,
        }),
        ...(bundled === undefined ? {} : { bundled }),
        dirs: freeze(
          registration.dirs.filter((directory) => directory !== rootScope),
        ),
      });
    }),
  );
}
