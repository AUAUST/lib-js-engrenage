import { array, optional, string } from "valibot";

import { includes, sort } from "@auaust/toolkit/array";
import { keys } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/index";
import { infoRulesSetting } from "#tools/eslint/constants";
import type { Config } from "#tools/eslint/types/Config";

/**
 * Lists, sorted, the rules an ESLint config array sets to `info` in its last
 * config object setting them.
 */
export function deriveInfoRules(configs: readonly Config[]): string[] {
  const infoRules = new Set<string>();

  for (const { rules = {}, settings = {} } of configs) {
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
