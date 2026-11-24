import { posix } from "node:path";

import { isString } from "@auaust/toolkit";
import { map } from "@auaust/toolkit/array";
import { freeze } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import type { EnvironmentPreset } from "#batiment/environments/ports/EnvironmentPreset";
import type { EnvironmentRegistration } from "#batiment/environments/types/EnvironmentRegistration";
import type { RegisteredEnvironment } from "#batiment/environments/types/RegisteredEnvironment";
import type { Directory } from "#types/Directory";

/**
 * Pairs each registration of the scope at `scope` with the preset it names,
 * its languages, execution fields and bundler pass tuned, its placements
 * resolved against the scope.
 *
 * @throws When a registration names a preset absent from `presets`.
 */
export function resolveRegisteredEnvironments(
  presets: readonly EnvironmentPreset[],
  registrations: readonly EnvironmentRegistration[],
  scope: Directory,
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
        scope,
        registration,
        preset,
        languages: freeze(
          map(registration.languages ?? preset.languages ?? [], (choice) => {
            return isString(choice) ? freeze({ name: choice }) : choice;
          }),
        ),
        execution: freeze({
          ...preset.execution,
          ...registration.execution,
        }),
        ...(bundled === undefined ? {} : { bundled }),
        dirs: freeze(
          registration.dirs
            .filter((directory) => directory !== rootScope)
            .map((directory) => posix.join(scope, directory)),
        ),
        files: freeze(
          map(registration.files, (glob) => posix.join(scope, glob)),
        ),
      });
    }),
  );
}
