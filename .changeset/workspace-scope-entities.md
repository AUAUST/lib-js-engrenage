---
"@auaust/engrenage": minor
---

- Replace `Entity.workspace` with `Entity.scope` and make `Entity.environment` optional, unset for a file outside every environment of its scope
- Name the scope in the lint message refusing an import of an undeclared workspace dependency
- List scope dependencies under `## Scopes` in the generated project map
