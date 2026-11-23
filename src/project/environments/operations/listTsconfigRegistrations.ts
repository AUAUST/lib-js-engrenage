import { freeze } from "@auaust/toolkit/object";

import { listEnvironmentEntries } from "#project/environments/operations/listEnvironmentEntries";
import type { EnvironmentRegistration } from "#batiment/environments/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Lists the registered environments whose preset has a tsconfig, among those
 * named after a contributed environment, whose `<name>.options` key holds
 * the `tsconfig` option.
 */
export async function listTsconfigRegistrations(
  config: ConfigResolver,
): Promise<readonly EnvironmentRegistration[]> {
  const [registrations, presets, entries] = await Promise.all([
    config.resolve("environments"),
    config.context.registry.contributions("environmentPresets", config),
    listEnvironmentEntries(config),
  ]);

  // @debt a registration takes a tsconfig only under a contributed environment's name, since tsconfigs stay keyed by built-in names until #868
  const contributed = new Set(entries.map(({ entry }) => entry.name));

  const withTsconfig = new Set(
    presets
      .filter(({ entry }) => entry.tsconfig === true)
      .map(({ entry }) => entry.name),
  );

  return freeze(
    registrations.filter(({ name, preset }) => {
      return contributed.has(name) && withTsconfig.has(preset);
    }),
  );
}
