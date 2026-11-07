---
"@auaust/engrenage": minor
---

- Add the top-level `visibility` option (`public` or `private`) of a published package, falling back to `publishConfig.access` in `package.json`, then `private`
- Export `PackageType` and `PublishAccess` from `@auaust/engrenage/package` instead of the root entry
