// @barrel setup
export { createEslintConfigStep } from "#tools/eslint/setup/createEslintConfigStep";
// @end

// @barrel config/definers
export { defineEslintConfig } from "#tools/eslint/config/defineEslintConfig";
// @end

// @barrel operations
export { createConventionRules } from "#tools/eslint/operations/createConventionRules";
export { createEslintConfig } from "#tools/eslint/operations/createEslintConfig";
export { createPackageJsonRules } from "#tools/eslint/operations/createPackageJsonRules";
export { createRecommendedRules } from "#tools/eslint/operations/createRecommendedRules";
export { fixWithEslint } from "#tools/eslint/operations/fixWithEslint";
export { listDebtMarkers } from "#tools/eslint/operations/listDebtMarkers";
export { loadConventionCategories } from "#tools/eslint/operations/loadConventionCategories";
export { loadInfoRules } from "#tools/eslint/operations/loadInfoRules";
export { resolveConventionSections } from "#tools/eslint/operations/resolveConventionSections";
export { resolveEslintFixArguments } from "#tools/eslint/operations/resolveEslintFixArguments";
export { resolveEslintSuppressArguments } from "#tools/eslint/operations/resolveEslintSuppressArguments";
export { resolveScope } from "#tools/eslint/operations/resolveScope";
export { resolveScopeSources } from "#tools/eslint/operations/resolveScopeSources";
export { selectConventions } from "#tools/eslint/operations/selectConventions";
// @end

// @barrel ports
export type * from "#tools/eslint/ports/ConventionEntry";
// @end

// @barrel types
export type * from "#tools/eslint/types/Config";
export type * from "#tools/eslint/types/ConfigObject";
export type * from "#tools/eslint/types/ConfigWithExtends";
export type * from "#tools/eslint/types/Convention";
export type * from "#tools/eslint/types/ConventionSections";
export type * from "#tools/eslint/types/ConventionValues";
export type * from "#tools/eslint/types/DebtMarker";
export type * from "#tools/eslint/types/Delegate";
export type * from "#tools/eslint/types/ImportGraph";
export type * from "#tools/eslint/types/Options";
export type * from "#tools/eslint/types/Plugin";
export type * from "#tools/eslint/types/ReportDescriptor";
export type * from "#tools/eslint/types/ResolvedSections";
export type * from "#tools/eslint/types/RoleRule";
export type * from "#tools/eslint/types/Rule";
export type * from "#tools/eslint/types/RuleModule";
export type * from "#tools/eslint/types/RuleOptions";
export type * from "#tools/eslint/types/Rules";
export type * from "#tools/eslint/types/rules/AuaustRules";
export type * from "#tools/eslint/types/rules/CoreRules";
export type * from "#tools/eslint/types/rules/ImportXRules";
export type * from "#tools/eslint/types/rules/JsdocRules";
export type * from "#tools/eslint/types/rules/PackageJsonRules";
export type * from "#tools/eslint/types/rules/PerfectionistRules";
export type * from "#tools/eslint/types/rules/SonarjsRules";
export type * from "#tools/eslint/types/rules/TypescriptEslintRules";
export type * from "#tools/eslint/types/rules/UnicornRules";
export type * from "#tools/eslint/types/rules/UnusedImportsRules";
export type * from "#tools/eslint/types/ScopeReference";
export type * from "#tools/eslint/types/ScopeReferences";
export type * from "#tools/eslint/types/ScopeSources";
export type * from "#tools/eslint/types/SelectedConvention";
// @end

export { optionsSchema } from "#tools/eslint/config/schemas/optionsSchema";
export { defineConvention } from "#tools/eslint/utils/defineConvention";
export { defineGlobalReplacement } from "#tools/eslint/utils/defineGlobalReplacement";
export { defineImportReplacement } from "#tools/eslint/utils/defineImportReplacement";
export { defineReplacement } from "#tools/eslint/utils/defineReplacement";
export { defineRoleRule } from "#tools/eslint/utils/defineRoleRule";
export { delegateRule } from "#tools/eslint/utils/delegateRule";
export { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";
export { normalizeRuleSchema } from "#tools/eslint/utils/normalizeRuleSchema";
export { visitImportSources } from "#tools/eslint/utils/visitImportSources";
export type {
  Entity,
  EnvironmentFileNames,
  LineageMember,
} from "#project/structure/index";
