---
"@auaust/engrenage": minor
---

- **Breaking:** removed the `stylistic.unpaddedSwitches` ESLint toggle; Prettier already strips blank lines at a switch's edges
- Prettier's `quoteProps` is now `"consistent"`, replacing the `@stylistic/quote-props` ESLint convention; `@stylistic/arrow-parens` is dropped too
