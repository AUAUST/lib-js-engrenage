---
"@auaust/engrenage": minor
---

Remove the `engrenage codegen barrels` command from the published CLI: it only served this package's own sources and now runs as an internal command. `syncBarrels` stays exported from `@auaust/engrenage/typescript`.
