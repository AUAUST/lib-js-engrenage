import { entries, hasOwn, keys } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/index";
import { listConfigSections } from "#workflows/config/operations/listConfigSections";
import type { LoadedConfig } from "#project/config/index";

// @debt each section is validated here and again when resolved; #249 validates it once through the resolver
// @debt validation runs apart from loading, so every caller must remember to validate and definers read an unvalidated config
export function validateConfig(config: LoadedConfig): LoadedConfig {
  const {
    raw,
    context: { root, configFile = root },
  } = config;

  const sections = listConfigSections();

  for (const [name, { declaration }] of entries(sections)) {
    if (declaration === undefined) {
      throw new Error(`Config section ${name} has no declaration`);
    }

    validate(declaration.schema, raw[name], `${name} config in ${configFile}`);
  }

  const unknown = keys(raw).filter((key) => !hasOwn(sections, key));

  if (unknown.length > 0) {
    throw new Error(
      `Invalid ${configFile}:\n${unknown.map((key) => `Unknown key "${key}"`).join("\n")}`,
    );
  }

  return config;
}
