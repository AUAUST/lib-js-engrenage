import {
  custom,
  is,
  picklist,
  record,
  string,
  tupleWithRest,
  union,
  unknown,
  type InferInput,
} from "valibot";

import { isFunction, isObject, isString } from "@auaust/toolkit";

import type { RoleRuleModule } from "#batiment/roles/ports/RoleRuleModule";
import type { RoleRuleLoader } from "#batiment/roles/types/RoleRuleLoader";

const severitySchema = picklist(["off", "warn", "error", 0, 1, 2]);

const ruleEntrySchema = union([
  severitySchema,
  tupleWithRest([severitySchema], unknown()),
]);

type RoleRule =
  | InferInput<typeof ruleEntrySchema>
  | RoleRuleModule
  | RoleRuleLoader;

function isRuleModule(value: unknown): value is RoleRuleModule {
  return isObject(value) && "tool" in value && isString(value.tool);
}

function isRoleRule(value: unknown): value is RoleRule {
  return is(ruleEntrySchema, value) || isRuleModule(value) || isFunction(value);
}

export const roleRulesSchema = record(
  string(),
  custom<RoleRule>(
    isRoleRule,
    "Expected a rule entry, a role rule module or its loader; wrap a raw rule module with `defineRoleRule`",
  ),
);
