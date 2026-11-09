---
"@auaust/engrenage": minor
---

- **Breaking**: Remove the `EntryValidator`, `ValidationResult` and `ValidationIssue` types; slot `entry` validators are typed by `StandardSchemaV1` from `@standard-schema/spec`. Upgrade: import `StandardSchemaV1` from `@standard-schema/spec` instead.
