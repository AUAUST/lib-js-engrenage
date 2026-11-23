---
"@auaust/engrenage": patch
---

- Rename the extension types `EnvironmentStructure` and `EnvironmentFileNames` to `NamespaceStructure` and `NamespaceFileNames`
- Rename the `environment` field of `RoleLocation` and `StructureDiagnostic` to `namespace`
- Rename the `environment` import boundary cause and its lint message ID to `namespace`
- Name top-level namespaces as namespaces in the generated project map
