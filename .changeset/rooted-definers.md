---
"@auaust/engrenage": minor
---

- Add `.at(root)` to every `define…Config` definer, loading the config of the project holding `root`, a directory or a file URL
- Root generated ESLint, tsdown, Vite and Vitest configs at their own file
- Migrate existing config files by hand: `defineEslintConfig(…)` → `defineEslintConfig.at(import.meta.url)(…)`
