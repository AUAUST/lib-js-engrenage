import { flatMap } from "@auaust/toolkit/array";

import type { Registry } from "#foundation/extensions/index";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";

export function checkPresetActivations(
  registry: Registry<Extension, ConfigResolver>,
): void {
  const presets = new Set(
    flatMap(registry.extensions, ({ contributes }) => {
      return (contributes?.presets ?? []).map(({ name }) => name);
    }),
  );

  const findings: string[] = [];

  for (const { name, when } of registry.extensions) {
    if (when === undefined || !("preset" in when)) {
      continue;
    }

    const { preset } = when;

    if (preset !== undefined && !presets.has(preset)) {
      findings.push(
        `${name} activates on preset "${preset}", which no registered extension contributes`,
      );
    }
  }

  if (findings.length > 0) {
    throw new Error(`Invalid extensions:\n${findings.join("\n")}`);
  }
}
