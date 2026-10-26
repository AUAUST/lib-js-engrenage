---
"@auaust/engrenage": patch
---

The tsdown preset enables `publint` and `attw` only when the project depends on `publint` and `@arethetypeswrong/core`, instead of failing at the pack step when they are not installed.
