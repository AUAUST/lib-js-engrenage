# coding-style

Local coding conventions and linting.

## 1. ESLint needs a custom exclusion for `data/**` and lints files outside the root config's paths.

- Where: `eslint.config.ts` (`ignores: ["data/apis/**"]`).
- Problem: ESLint fails on `data/` because no tsconfig includes its files, so the config carries a custom ignore. This reveals a broader issue: ESLint should not try to lint files that no tsconfig path of the root config includes.
- Expected: the generated ESLint config derives what it lints from the paths the project's tsconfigs include, so no manual exclusion is needed.
- Done when `eslint.config.ts` needs no `data` exclusion and files outside the configured paths are not linted.
