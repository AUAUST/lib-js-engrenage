---
"@auaust/engrenage": minor
---

- Add the top-level `visibility` option (`public` or `private`) of a published package, falling back to `publishConfig.access` in `package.json`, then `private`
- Export `PackageType` and `PublishAccess` from `@auaust/engrenage/package` instead of the root entry
- `engrenage init` asks the visibility of a published project, writes it to `engrenage.config.ts` and derives the license from it
