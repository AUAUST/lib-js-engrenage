---
"@auaust/engrenage": minor
---

- Rename `tests.layout` (`"roots" | "mirror"`) to `tests.mirror` (boolean, default `false`): `layout: "mirror"` becomes `mirror: true`
- Rename `bin.layout` and `scripts.layout` to `tree`, and the `bin.commands` map to `bin.entries`
- Reject each old key with a message naming its replacement
