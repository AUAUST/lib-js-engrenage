---
"@auaust/engrenage": patch
---

- Stop falling back to the base tsconfig when `tsconfig.tests.dist.json` is missing: `config.tests.dist.tsconfig.path` is now `undefined`, and the build-mode Vitest config and `engrenage tsc:dist` fail naming the file and `engrenage sync`
