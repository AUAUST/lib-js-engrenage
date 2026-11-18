import { array, custom } from "valibot";

import { isPlainObject } from "@auaust/toolkit";

import { eslint } from "#constants";
import { importConfigFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { loadConfig } from "#project/config/index";
import { createEslintConfig } from "#tools/eslint/operations/createEslintConfig";
import type { Config } from "#tools/eslint/types/Config";
import type { Directory } from "#types/Directory";

// @debt checks only that each config object is a plain object; ESLint validates the rest when it receives the array
const loadedConfigsSchema = array(
  custom<Config>(isPlainObject, "Expected an ESLint config object"),
);

/**
 * Loads the project's ESLint config array; without a config file, builds
 * engrenage's default config instead.
 */
export async function loadEslintConfigs(root: Directory): Promise<Config[]> {
  const {
    config: loaded,
    _configFile,
  } = await importConfigFile(root, `${eslint}.config`);

  if (_configFile === undefined) {
    return createEslintConfig(await loadConfig(root), {
      ignore: false,
    });
  }

  return validate(loadedConfigsSchema, loaded, _configFile);
}
