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

const severitySchema = picklist(["off", "warn", "error", 0, 1, 2]);

const ruleEntrySchema = union([
  severitySchema,
  tupleWithRest([severitySchema], unknown()),
]);

type RuleEntry = InferInput<typeof ruleEntrySchema>;

function isRuleEntry(value: unknown): value is RuleEntry {
  return is(ruleEntrySchema, value);
}

// @debt rule entries are ESLint's, a tool the language- and tool-agnostic role contract should not name; lint could key them by role name as it keys rule loaders
export const roleRulesSchema = record(
  string(),
  custom<RuleEntry>(
    isRuleEntry,
    "Expected a rule entry; give a role rule module to `defineEslintConfig`'s `roleRules` option, keyed by role name",
  ),
);
