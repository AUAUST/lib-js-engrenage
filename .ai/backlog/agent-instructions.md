# agent-instructions

Agent instruction resolution and synchronization.

## 1. References resolve with CommonJS conditions.

- Where: `src/agents/utils/resolveAgentReference.ts`
- Problem: `createRequire(from).resolve` applies the `require` condition, so a fragment a package exports only under `import` cannot be referenced.
- Fix: resolve references with ESM conditions. `import.meta.resolve` still ignores its parent argument without `--experimental-import-meta-resolve` (Node 26), so this needs another resolver. Part of AUAUST/lib-js-engrenage#9.

## 2. No discovery or sync of skills provided by dependencies.

- Problem: toolkit may publish a generated agent skill (toolkit backlog `documentation.2`), but nothing lists or syncs skills that dependencies provide.
- Fix: first check which conventions already distribute skills through packages; otherwise add a package-level skill declaration (in the spirit of `exports`) and an engrenage command listing available skills and keeping them up to date.
- Done when engrenage discovers and syncs skills declared by dependencies, or obsolete if an existing convention covers it.
