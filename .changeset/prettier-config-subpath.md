---
"@auaust/engrenage": minor
---

- Move the ready-made Prettier config to `@auaust/engrenage/prettier/config`; `@auaust/engrenage/prettier` no longer has a default export
- Point a `package.json` `prettier` key set to `@auaust/engrenage/prettier` to the new subpath on sync
