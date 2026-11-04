import { array, looseObject, optional, record, string, unknown } from "valibot";

import { includes, sort } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";

import { eslint } from "#constants";
import { importConfigFile } from "#foundation/filesystem/operations/importConfigFile";
import { validate } from "#foundation/options/utils/validate";
import { infoRulesSetting } from "#tools/eslint/constants";
import { createEslintConfig } from "#tools/eslint/operations/createEslintConfig";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";

const loadedConfigsSchema = array(
  looseObject({
    rules: optional(record(string(), unknown())),
    settings: optional(record(string(), unknown())),
  }),
);

async function loadEslintConfigs(config: ResolvedConfig) {
  const { config: loaded, _configFile } = await importConfigFile(
    config.root,
    `${eslint}.config`,
  );

  if (_configFile === undefined) {
    return createEslintConfig(config, {
      ignore: false,
    });
  }

  return validate(loadedConfigsSchema, loaded, _configFile);
}

export async function loadInfoRules(config: ResolvedConfig): Promise<string[]> {
  const infoRules = new Set<string>();

  for (const { rules = {}, settings = {} } of await loadEslintConfigs(config)) {
    const declared =
      validate(
        optional(array(string())),
        settings[infoRulesSetting],
        `${infoRulesSetting} setting`,
      ) ?? [];

    for (const name of keys(rules)) {
      if (includes(declared, name)) {
        infoRules.add(name);
      } else {
        infoRules.delete(name);
      }
    }
  }

  return sort([...infoRules]);
}
