---
"@auaust/engrenage": minor
---

- Turn `typescript.tsconfig` into a group (`path`, `extends`, `compilerOptions`, `unmanaged`) and move `typescript.distTsconfig` to `tests.dist.tsconfig.path`, defaulting to `tsconfig.tests.dist.json`
- Add a `tsconfig` group (`path`, `inherits`, `extends`, `include`, `lib`, `types`, `compilerOptions`, `unmanaged`, `check`) to the `src`, `tests`, `bin`, `scripts` and `tooling` environments and to `tests.dist`, resolved into `config.<environment>.tsconfig` with its owner, following `inherits` and failing on cycles and conflicting options
- Warn when the base tsconfig is not named `tsconfig.json`
