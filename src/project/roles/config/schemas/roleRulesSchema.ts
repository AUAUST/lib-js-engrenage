import {
  custom,
  picklist,
  record,
  string,
  tupleWithRest,
  union,
  unknown,
} from "valibot";
// @debt the tool-agnostic roles domain describes ESLint rules and imports ESLint types; a role could carry tool rules through a contract the ESLint domain implements
import type { Rule } from "eslint";

import { isFunction } from "@auaust/toolkit/isFunction";
import { isObject } from "@auaust/toolkit/isObject";

function isRuleModule(value: unknown): value is Rule.RuleModule {
  return isObject(value) && "create" in value && isFunction(value.create);
}

const severitySchema = picklist(["off", "warn", "error", 0, 1, 2]);

const ruleEntrySchema = union([
  severitySchema,
  tupleWithRest([severitySchema], unknown()),
]);

export const roleRulesSchema = record(
  string(),
  union([
    ruleEntrySchema,
    custom<Rule.RuleModule>(isRuleModule, "Expected an ESLint rule module"),
  ]),
);
