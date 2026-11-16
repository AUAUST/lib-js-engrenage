---
"@auaust/engrenage": patch
---

ESLint loads `eslint.config.ts` natively in every engrenage invocation and the editor, and the lint hook loads it once per call.
