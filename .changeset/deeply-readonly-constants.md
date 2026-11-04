---
"@auaust/engrenage": patch
---

- Freeze the global-name and identifier patterns and make `GlobGroup` fields read-only; the ESLint package.json, import and attw option objects live inline in their only consumer.
