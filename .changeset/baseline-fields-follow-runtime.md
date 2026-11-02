---
"@auaust/engrenage": patch
---

- Remove `noLib`, a `null` `lib` and the baseline and API `types` from a tsconfig whose environment has no baseline runtime
- Reject `<env>.tsconfig.lib: false` for a baseline runtime
