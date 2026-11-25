---
"@auaust/engrenage": minor
---

- Order the directories of a namespace spanning several directories by its config root `layers`, so a lower directory importing a higher one fails the boundary checks and peer directories follow the root `relation`
- Fail with `unknown-directory-layer` on a root `layers` entry, other than `*`, naming none of the namespace's directories
- Stop a later directory's root `entry.ts` from reaching a higher directory
