---
"@auaust/engrenage": minor
---

- Export the resolved structure types from `@auaust/engrenage/extensions`, marked experimental: `ResolvedStructure`, `EnvironmentStructure`, `ResolvedRoleContract` and the types they reference, so an extension reads `await config.resolve("structure")` instead of re-deriving domains and roles
- Deep-freeze the resolved structure: its nodes, role files, file names and roles are read-only at runtime
