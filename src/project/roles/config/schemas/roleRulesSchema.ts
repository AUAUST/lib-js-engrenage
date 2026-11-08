import {
  custom,
  picklist,
  record,
  string,
  tupleWithRest,
  union,
  unknown,
} from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";
import { isObject } from "@auaust/toolkit/isObject";

import type { RoleRuleLoader } from "#project/roles/types/RoleRuleLoader";
import type { RoleRuleModule } from "#project/roles/types/RoleRuleModule";

function isRuleModule(value: unknown): value is RoleRuleModule {
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
    custom<RoleRuleModule>(isRuleModule, "Expected an ESLint rule module"),
    custom<RoleRuleLoader>(isFunction, "Expected an ESLint rule module loader"),
  ]),
);
