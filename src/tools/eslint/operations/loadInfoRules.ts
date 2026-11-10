import { array, looseObject, optional, record, string, unknown } from "valibot";

import { includes, sort } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";

import { eslint } from "#constants";
import { importConfigFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { loadConfig } from "#project/config/index";
import { infoRulesSetting } from "#tools/eslint/constants";
import { createEslintConfig } from "#tools/eslint/operations/createEslintConfig";
import type { Directory } from "#types/Directory";

const loadedConfigsSchema = array(
  looseObject({
    rules: optional(record(string(), unknown())),
    settings: optional(record(string(), unknown())),
  }),
);

async function loadEslintConfigs(root: Directory) {
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

export async function loadInfoRules(root: Directory): Promise<string[]> {
  const infoRules = new Set<string>();

  for (const { rules = {}, settings = {} } of await loadEslintConfigs(root)) {
    const declared = (
      validate(
        optional(array(string())),
        settings[infoRulesSetting],
        `${infoRulesSetting} setting`,
      ) ?? []
    );

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
