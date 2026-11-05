---
"@auaust/engrenage": minor
---

- Resolve config sections asynchronously: `loadConfig` and the definer callbacks (`defineEslintConfig`, `defineViteConfig`, `defineTsdownConfig`, `defineVitestConfig`, `definePrettierConfig`) receive a `{ get }` accessor, read with `await get("<section>")`, instead of the flat config
- Make `build.outDir`, `src.exports` and `typescript.tsconfig.path` promise-valued, and `createEslintConfig` async
