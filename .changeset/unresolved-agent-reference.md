---
"@auaust/engrenage": patch
---

- Warn about an unresolvable agent `@reference` and leave its block untouched instead of failing init and sync
- Let a `syncBlocks` filler return `undefined` to keep its block as it is
