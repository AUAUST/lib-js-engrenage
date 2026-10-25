---
"@auaust/engrenage": patch
---

Initial release of shared tooling configuration for AUAUST projects.

- ESLint flat config builder with AUAUST base, import, stylistic, promise and restricted-syntax rules
- Prettier config, usable directly as the `prettier` key or extended through a builder
- Base tsconfig preset (`@auaust/engrenage/typescript/presets/base.json`)
- Turns tsconfig `paths` into Vite aliases
- Shared AGENTS.md sections and `.claude/rules` files, kept up to date in consuming projects through `@reference` blocks
- `engrenage` CLI: `agents sync` syncs agent instruction files, `codegen barrels` generates `index.ts` barrels; both support `--check` for CI
