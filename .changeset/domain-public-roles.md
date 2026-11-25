---
"@auaust/engrenage": patch
---

- Export each module of a public role at every depth its `nesting` allows in workspace exports
- Add the domain `publicRoles` option, making roles public in that domain's subtree only, for lint and workspace exports alike
