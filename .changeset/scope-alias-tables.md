---
"@auaust/engrenage": patch
---

- Resolve `#…` imports in lint and the import cycle check from the alias table of the importer's workspace, and its package name as the importer's own
- Add the `aliases.scopes` config key, holding each scope's alias table relative to that scope
