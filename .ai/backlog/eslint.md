# eslint

Upstream ESLint API limitations.

## 1. ESLint core rule modules are only reachable through a deprecated export.

- why: `builtinRules` from `eslint/use-at-your-own-risk` is deprecated and `eslint/rules` only ships types, so no supported way loads a core rule module to delegate it or generate its types (`src/tools/eslint/utils/findUpstreamRule.ts`, `src/tools/eslint/operations/generateRuleTypes.ts`).
- want: the supported accessor, once ESLint provides one.
