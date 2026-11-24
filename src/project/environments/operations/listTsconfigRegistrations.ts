import { freeze } from "@auaust/toolkit/object";

import type { EnvironmentRegistration } from "#batiment/environments/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Lists the registered environments whose preset has a tsconfig, which
 * `environments.<name>.tsconfig` configures.
 */
export async function listTsconfigRegistrations(
  config: ConfigResolver,
): Promise<readonly EnvironmentRegistration[]> {
  const [registrations, presets] = await Promise.all([
    config.resolve("environments"),
    config.context.registry.contributions("environmentPresets", config),
  ]);

  const withTsconfig = new Set(
    presets
      .filter(({ entry }) => entry.tsconfig === true)
      .map(({ entry }) => entry.name),
  );

  return freeze(registrations.filter(({ preset }) => withTsconfig.has(preset)));
}
