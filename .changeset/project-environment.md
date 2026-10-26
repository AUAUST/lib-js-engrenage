---
"@auaust/engrenage": minor
---

The resolved config exposes `environment`, a lazy view of the packages the project declares. `config.environment.has(name)` is true for every package listed in the `dependencies`, `devDependencies`, `peerDependencies` or `optionalDependencies` of `package.json`, and for the package's own name. It is always false without a `package.json`. The new `packageJson.dependencies` accessor lists those package names, and an invalid dependency field fails with the field name. `Environment` is exported from `@auaust/engrenage/config`, and `PackageNames` from `@auaust/engrenage`.

ESLint conventions can declare `requires`, a list of package names. Such a convention is on by default only when the environment has every one of them, on top of its presets. ESLint options still turn it on or off individually or by category.

**Breaking:** library-specific conventions now require their library.

- `noObjectStatics`, `noArrayIsArray`, `noIsNull`, `noIsUndefined` and `noToolkitRoot` require `@auaust/toolkit`.
- `noPrimitiveKitRoot` requires `@auaust/primitive-kit`.
- `noValibotNamespace` requires `valibot`.
- `noZodClassic` and `noZodNamespace` require `zod`.

A project that does not declare a library no longer gets these conventions unless its options enable them explicitly.
