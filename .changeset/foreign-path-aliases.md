---
"@auaust/engrenage": minor
---

tsdown entries skip tsconfig path aliases that are neither the package name nor one of its subpaths (`~/*`, `@/*`, `$lib/*`) instead of failing, so projects with internal aliases can build. Those aliases keep resolving from the tsconfig in TypeScript, tsdown and Vitest. The package's own aliases are still validated.
