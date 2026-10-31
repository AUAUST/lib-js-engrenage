---
"@auaust/engrenage": minor
---

- Add the `tsconfig` target to `engrenage sync`: it writes only the fields engrenage manages into the base and each owned environment tsconfig, leaves `false` lists and `unmanaged` scalars alone, applies `compilerOptions` as given and creates the tsconfig of every active environment
