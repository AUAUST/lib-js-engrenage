---
"@auaust/engrenage": minor
---

- Enable a namespace's scoped roles with `roles.enable` in its `.namespace.json`
- Give each directory of a namespace spanning several directories its own purpose, enabled roles and language default roles, and its own project map row
- Fail when the config enables roles at the root of a namespace spanning several directories: enable them in each directory's `.namespace.json` instead
