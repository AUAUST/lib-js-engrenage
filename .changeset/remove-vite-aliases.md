---
"@auaust/engrenage": minor
---

**Breaking:**

- `@auaust/engrenage/vite` drops `createViteAliases` and the `Alias` type: Vitest resolves sources through Vite's `resolve.tsconfigPaths`.
- `PathAlias` drops `alias`, keeping the `name` and `path` tsdown entries need.
