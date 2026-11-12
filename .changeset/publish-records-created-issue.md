---
"@auaust/engrenage": patch
---

- Record a created issue on disk before its Blockers write in `planning issue publish`, so a failed publish never creates it twice
