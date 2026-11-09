---
"@auaust/engrenage": minor
---

- **Breaking**: Replace `parseMajorVersion` with `parseVersion` in `@auaust/engrenage/package`, yielding a `Version` with major, minor and patch. Upgrade: read `parseVersion(specifier)?.major`.
- Fail `engrenage sync` on a pnpm specifier without a version instead of accepting it as within engrenage's range
