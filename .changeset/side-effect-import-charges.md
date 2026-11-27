---
"@auaust/engrenage": minor
---

- Charge the configured `structure.effects.fallback` to an import whose specifier resolves to no module in `auaust/import-effects`
- Report a side-effect import above its importer's evaluation ceiling with the fixes it takes, and offer to drop one whose target evaluates `pure`
- Add `imports` to build tool entries, ranking the imports a bundler erases in the environments it bundles
- Rank CSS, `?url` and `?raw` imports `pure` in environments Vite bundles
