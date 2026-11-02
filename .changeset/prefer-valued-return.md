---
"@auaust/engrenage": minor
---

- Warn about an empty `undefined` guard followed by a single valued return, with a fix wrapping the return in the negated check, through the new type-aware `auaust/prefer-valued-return` rule, skipped under `noImplicitReturns`
