---
"@auaust/engrenage": minor
---

- Add `engrenage gate --all`, checking the whole project without fixing anything
- Write `engrenage gate --all` as the `ci:check` script on init; replace a hand-written `ci:check` with it, since init never overwrites an existing script
- Let extensions give a gate step a `check` run by `gate --all`
