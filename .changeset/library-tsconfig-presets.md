---
"@auaust/engrenage": minor
---

Add the `library.json` and `library.dist.json` tsconfig presets. `library.json` extends `base.json` and places `outDir` and `rootDir` in the consuming project. `library.dist.json` type-checks `tests/**/*.ts` and every `env.d.ts` against the built package; extend it after the project's own tsconfig (`"extends": ["./tsconfig.json", "@auaust/engrenage/tsconfig/library.dist.json"]`).

**Breaking:** `base.json` now sets `declaration: false`, so running `tsc` directly no longer writes `.d.ts` files next to sources. Build tools that generate declarations must enable them explicitly (for tsdown: `dts: { compilerOptions: { declaration: true } }`).
