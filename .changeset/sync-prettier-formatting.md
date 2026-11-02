---
"@auaust/engrenage": patch
---

- Format the files `engrenage sync` and `engrenage init` write with the project's Prettier when it is installed, so synced output passes `prettier --check`; `sync --check` no longer reports format-only drift
