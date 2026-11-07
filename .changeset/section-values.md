---
"@auaust/engrenage": minor
---

- Read config sections by value: `loadConfig` and the definer callbacks receive a `LoadedConfig`, read with `await resolve(<section>)` (the section values, such as `sourceSection` or `gitSection`, are exported from `@auaust/engrenage`), instead of `await get("<section>")`
- Move `root`, `filesystem` and `configFile` to `config.context`, rename the `resolve(...paths)` helper `context.path`, and replace `cacheFor(name)` with `(await resolve(cacheSection)).for(name)`
- Replace the `Config` type with `LoadedConfig`, and read `src.exports` through `sourceExportsSection` `typescript.tsconfig.path` through `tsconfigPathSection` and `build.outDir` through `buildOutDirSection`
- Move `sourceTestsVariant` and `distTestsVariant` out of `@auaust/engrenage/config/constants`
