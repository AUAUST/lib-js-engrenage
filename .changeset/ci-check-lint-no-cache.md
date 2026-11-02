---
"@auaust/engrenage": patch
---

The `ci:check` script added by `engrenage init` lints without the ESLint cache, so type-aware rules catch errors caused by changes in imported modules as CI does.
