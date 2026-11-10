---
"@auaust/engrenage": patch
---

A failing sync check, such as `publishing`, no longer discards the files `engrenage sync` writes: sync writes them, reports every failed check and exits with code 1.
