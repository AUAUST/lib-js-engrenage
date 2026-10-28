# agent-instructions

Agent instruction resolution and synchronization.

## 1. References resolve with CommonJS conditions.

- Where: `src/agents/utils/resolveAgentReference.ts`
- Problem: `createRequire(from).resolve` applies the `require` condition, so a fragment a package exports only under `import` cannot be referenced.
- Fix: resolve references with ESM conditions. `import.meta.resolve` still ignores its parent argument without `--experimental-import-meta-resolve` (Node 26), so this needs another resolver. Part of AUAUST/lib-js-engrenage#9.
