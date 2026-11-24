---
"@auaust/engrenage": minor
---

- Move the tsconfig options of environments from `<name>.tsconfig` to `environments.<name>.tsconfig`
- Write one root tsconfig per registered environment whose preset has a tsconfig, built-in names or not
- Fail when `environments.<name>.tsconfig` is set on an environment whose preset has no tsconfig
