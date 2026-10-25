# @auaust/engrenage

## 0.0.1

### Patch Changes

- [`60a24eb`](https://github.com/AUAUST/lib-js-engrenage/commit/60a24eb43b3616cdb5bb53d2f8673d8df4064d96) Thanks [@apademide](https://github.com/apademide)! - Initial release of shared tooling configuration for AUAUST projects.

  - ESLint flat config builder with AUAUST base, import, stylistic, promise and restricted-syntax rules
  - Prettier config, usable directly as the `prettier` key or extended through a builder
  - Base tsconfig preset (`@auaust/engrenage/typescript/presets/base.json`)
  - Turns tsconfig `paths` into Vite aliases
  - Shared AGENTS.md sections and `.claude/rules` files, kept up to date in consuming projects through `@reference` blocks
  - `engrenage` CLI: `agents sync` syncs agent instruction files, `codegen barrels` generates `index.ts` barrels; both support `--check` for CI
