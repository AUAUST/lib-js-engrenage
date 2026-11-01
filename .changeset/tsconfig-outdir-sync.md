---
"@auaust/engrenage": minor
---

- Write `build.outDir` into the `src` tsconfig's `compilerOptions.outDir` on `engrenage sync` when it differs from the `outDir` the tsconfig inherits, so `tsc` and editors build into the same directory as tsdown and Vitest
