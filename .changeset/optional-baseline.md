---
"@auaust/engrenage": patch
---

- Make `src.baseline` optional: without it, sync warns and leaves the baseline libraries, types and build target out
- Reject `src.apis` without `src.baseline`
