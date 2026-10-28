# eslint

Upstream ESLint API limitations.

## 1. ESLint core rule modules are only reachable through a deprecated export.

- Where: `src/eslint/utils/findUpstreamRule.ts`, `src/eslint/utils/syncRuleTypes.ts`
- Problem: `builtinRules` from `eslint/use-at-your-own-risk` is marked deprecated, and `eslint/rules` only ships types, so there is no supported way to load a core rule module to delegate it or generate its types.
- Fix: move to the supported accessor once ESLint provides one.
