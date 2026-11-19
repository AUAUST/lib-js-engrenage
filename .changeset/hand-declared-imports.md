---
"@auaust/engrenage": minor
---

- Keep hand-declared `package.json` `imports` and tsconfig `paths` entries on `sync` and `init`
- Delete generated `imports` and `paths` entries whose alias is gone, bundler aliases included
- Fail `sync` on a hand-declared entry whose key an alias generates with another target
- Record generated alias keys in the committed `.engrenage/sync.json`
