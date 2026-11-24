import { array, is, looseObject, optional, string } from "valibot";

import { environmentPresetFields } from "#batiment/environments/constants";
import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/index";

const environmentOptions = looseObject({
  kind: optional(string()),
  languages: environmentPresetFields.languages,
  dirs: array(string()),
  files: optional(array(string())),
});

/**
 * Reads the placement and tuning fields the `<name>.options` key of a contributed
 * environment resolves.
 */
export async function readEnvironmentOptions(
  config: Resolver<ConfigContext>,
  name: string,
) {
  const key = `${name}.options`;

  const option = await config.resolve(key);

  if (!is(environmentOptions, option)) {
    throw new Error(
      `Config key "${key}" resolves to no environment options: it lacks a \`dirs\` list, or holds a \`kind\` that is not a string or a \`languages\` or \`files\` that is not a list`,
    );
  }

  return { key, option };
}
