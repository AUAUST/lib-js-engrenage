---
"@auaust/engrenage": minor
---

- Write `compilerOptions.target`, `lib` and `types` of each environment tsconfig on `engrenage sync` from the environment's runtime: a baseline snapshot gives its target and libs with no types, a Node major gives its target, libs and `node` types. `lib` and `types` accept list adjustments, and `compilerOptions.target` overrides the target
