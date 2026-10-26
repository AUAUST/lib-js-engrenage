---
"@auaust/engrenage": patch
---

A tsconfig `outDir` outside the project root no longer breaks the resolved config: `tsconfig.outDir` stays relative to the root (`../build`) and is left out of ignored files. An `outDir` equal to the root now fails, naming the tsconfig.
